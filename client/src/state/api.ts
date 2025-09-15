import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { fetchAuthSession, getCurrentUser } from "aws-amplify/auth";

// Interface User object
interface User {
  cognitoInfo: {
    signInDetails?: any;
    username: string;
    userId: string;
  };
  userInfo: any;
  userRole: string;
}

type UserRole = "user" | "creator" | "admin";

export const api = createApi({
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
    prepareHeaders: async (headers) => {
      try {
        const session = await fetchAuthSession();
        const { idToken } = session.tokens ?? {};
        if (idToken) {
          headers.set("Authorization", `Bearer ${idToken}`);
        }
      } catch (error) {
        console.error("Failed to get auth session:", error);
      }
      return headers;
    },
  }),
  reducerPath: "api",
  tagTypes: ["User", "Project", "Upload"],
  endpoints: (build) => ({
    // Auth related endpont

    getAuthUser: build.query<User, void>({
      queryFn: async () => {
        try {
          const session = await fetchAuthSession();
          const { idToken } = session.tokens ?? {};
          const user = await getCurrentUser();
          const userRole =
            (idToken?.payload?.["custom:role"] as UserRole) || "user";

          // Check if user exists in database
          try {
            const response = await fetch(
              `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/profile/${user.userId}`,
              {
                headers: {
                  Authorization: `Bearer ${idToken}`,
                },
              }
            );

            if (!response.ok) {
              if (response.status === 404) {
                // Parse the error response to get more details
                const errorData = await response.json();

                // Check if this is specifically a "needs registration" error
                if (
                  errorData.errors &&
                  errorData.errors[0]?.needsRegistration
                ) {
                  return {
                    error: {
                      status: "USER_NOT_IN_DB",
                      cognitoUser: user,
                      userRole,
                    },
                  } as any;
                }
              }

              throw new Error(
                `HTTP ${response.status}: ${response.statusText}`
              );
            }

            const userProfile = await response.json();

            return {
              data: {
                cognitoInfo: {
                  signInDetails: user.signInDetails,
                  username: user.username,
                  userId: user.userId,
                },
                userInfo: userProfile.data,
                userRole,
              },
            };
          } catch (dbError) {
            console.error("Database check error:", dbError);
            // Database check failed, return error for user creation
            return {
              error: {
                status: "USER_NOT_IN_DB",
                cognitoUser: user,
                userRole,
              },
            };
          }
        } catch (error: any) {
          return {
            error: {
              status: "CUSTOM_ERROR",
              error: error.message || "Could not fetch user data",
            },
          };
        }
      },
      providesTags: ["User"],
    }),

    /* ----------------------------User Related Endpoints--------------------------------------------*/

    // Separate endpoint to get user profile
    getUserProfile: build.query<any, string>({
      query: (userId) => `/auth/profile/${userId}`,
      providesTags: ["User"],
    }),

    // Manual user creation
    createUser: build.mutation<
      any,
      {
        cognitoId: string;
        name: string;
        email: string;
        phoneNumber?: string;
        role?: string;
      }
    >({
      query: (userData) => ({
        url: "/auth/create-user",
        method: "POST",
        body: userData,
      }),
      invalidatesTags: ["User"],
    }),

    // Update user profile
    updateUserProfile: build.mutation<any, { userId: string; data: any }>({
      query: ({ userId, data }) => ({
        url: `/auth/profile/${userId}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["User"],
    }),

    //get all users

    getAllUsers: build.query<
      any,
      {
        page?: number;
        limit?: number;
        role?: string;
        search?: string;
        sortBy?: string;
        sortOrder?: string;
      }
    >({
      query: (filters = {}) => ({
        url: "/auth/users",
        params: filters,
      }),
      providesTags: ["User"],
    }),

    //update user role

    updateUserRole: build.mutation<any, { userId: string; role: string }>({
      query: ({ userId, role }) => ({
        url: `/auth/users/${userId}/role`,
        method: "PUT",
        body: { role },
      }),
      invalidatesTags: ["User"],
    }),

    /* ----------------------------Project Related Endpoints--------------------------------------------*/

    // Get projects by creator

    getProjectsByCreator: build.query<
      any,
      {
        creatorId: string;
        page?: number;
        limit?: number;
        status?: string;
      }
    >({
      query: ({ creatorId, ...params }) => ({
        url: `/projects/creator/${creatorId}`,
        params,
      }),
      providesTags: (result, error, { creatorId }) => [
        { type: "Project", id: `creator-${creatorId}` },
      ],
    }),

    // create project

    createProject: build.mutation<
      any,
      {
        title: string;
        description: string;
        shortDescription: string;
        category: string;
        targetAmount: number;
        startDate: string;
        endDate: string;
        location: { district: string; division: string };
        story: string;
        risks: string;
        images?: string[];
        videoUrl?: string;
        rewardTiers?: any[];
        tags?: string[];
      }
    >({
      query: (projectData) => ({
        url: "/projects",
        method: "POST",
        body: projectData,
      }),
      invalidatesTags: ["Project"],
    }),

    // get trending projects -> Can show on homepage

    getTrendingProjects: build.query<any, { limit?: number }>({
      query: ({ limit = 6 } = {}) => ({
        url: "/projects/trending",
        params: { limit },
      }),
      providesTags: ["Project"],
    }),

    // get projects by category -> Can use on search page

    getProjectsByCategory: build.query<any, void>({
      query: () => "/projects/categories",
      providesTags: ["Project"],
    }),

    // get project by slug -> Use this to get single project infos, this also has donation related info in the controller as if target , current amount etc

    getProject: build.query<any, string>({
      query: (slug) => `/projects/${slug}`,
      providesTags: (result, error, slug) => [{ type: "Project", id: slug }],
    }),

    // update project by id -> creator id has to match logged in id to update

    updateProject: build.mutation<any, { id: string; data: any }>({
      query: ({ id, data }) => ({
        url: `/projects/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Project", id }],
    }),

    // delete project by id 

    deleteProject: build.mutation<any, string>({
      query: (id) => ({
        url: `/projects/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Project"],
    }),

    // what updates were done to the project

    getProjectUpdates: build.query<any, string>({
      query: (id) => `/projects/${id}/updates`,
      providesTags: (result, error, id) => [
        { type: "Project", id: `${id}-updates` },
      ],
    }),

    // add more updates to the project

    addProjectUpdate: build.mutation<
      any,
      {
        id: string;
        data: { title: string; content: string; images?: string[] };
      }
    >({
      query: ({ id, data }) => ({
        url: `/projects/${id}/updates`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Project", id },
        { type: "Project", id: `${id}-updates` },
      ],
    }),

    // get statistics of project by id -> all info DONATION related data

    getProjectStats: build.query<any, string>({
      query: (id) => `/projects/${id}/stats`,
      providesTags: (result, error, id) => [
        { type: "Project", id: `${id}-stats` },
      ],
    }),

    /* ----------------------------S3 / Files Related Endpoints --------------------------------------------*/

    // uplod multiple files - Upload images role based

    uploadMultipleFiles: build.mutation<
      any,
      {
        files: File[];
        folder?: string;
        resize?: string;
        quality?: number;
      }
    >({
      query: ({ files, folder = "uploads", resize, quality }) => {
        const formData = new FormData();
        files.forEach((file) => formData.append("files", file));
        formData.append("folder", folder);
        if (resize) formData.append("resize", resize);
        if (quality) formData.append("quality", quality.toString());

        return {
          url: "/upload/multiple",
          method: "POST",
          body: formData,
        };
      },
      invalidatesTags: ["Upload"],
    }),

    //below is closing tag for all endpoints
  }),
});

export const {
  useGetAuthUserQuery,
  useGetUserProfileQuery,
  useCreateUserMutation,
  useUpdateUserProfileMutation,
  useGetAllUsersQuery,
  useUpdateUserRoleMutation,
  useGetTrendingProjectsQuery,
  useGetProjectsByCategoryQuery,
  useGetProjectQuery,
  useCreateProjectMutation,
  useUpdateProjectMutation,
  useDeleteProjectMutation,
  useGetProjectUpdatesQuery,
  useAddProjectUpdateMutation,
  useGetProjectStatsQuery,
  useGetProjectsByCreatorQuery,
} = api;
