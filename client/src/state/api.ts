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
  tagTypes: ["User"],
  endpoints: (build) => ({
    // Simplified approach - just check user exists, don't auto-create
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

    getAllUsers: build.query<any, {
      page?: number;
      limit?: number;
      role?: string;
      search?: string;
      sortBy?: string;
      sortOrder?: string;
    }>({
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
  }),
});

export const {
  useGetAuthUserQuery,
  useGetUserProfileQuery,
  useCreateUserMutation,
  useUpdateUserProfileMutation,
} = api;
