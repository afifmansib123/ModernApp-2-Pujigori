import React from "react";
import { Amplify } from "aws-amplify";
import { useAuthenticator } from "@aws-amplify/ui-react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { useGetAuthUserQuery, useCreateUserMutation } from "@/state/api";
import CustomAuth from "./CustomAuth"; // Import your custom auth component

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: process.env.NEXT_PUBLIC_AWS_COGNITO_USER_POOL_ID!,
      userPoolClientId: process.env.NEXT_PUBLIC_AWS_COGNITO_USER_POOL_CLIENT_ID!,
    },
  },
});

// Database sync component (keep this the same)
function DatabaseSync({ children }: { children: React.ReactNode }) {
  const { user } = useAuthenticator((context) => [context.user]);
  const { data: authUser, isLoading, error, refetch } = useGetAuthUserQuery(undefined, {
    skip: !user,
  });
  const [createUser, { isLoading: isCreating }] = useCreateUserMutation();

  useEffect(() => {
    const handleUserCreation = async () => {
      if (!user || isLoading || authUser) return;
      
      if (error && (error as any)?.status === "USER_NOT_IN_DB") {
        const cognitoUser = (error as any).cognitoUser;
        const userRole = (error as any).userRole;
        
        try {
          const { fetchUserAttributes } = await import('aws-amplify/auth');
          const userAttributes = await fetchUserAttributes();
          
          await createUser({
            cognitoId: cognitoUser.userId,
            name: userAttributes.name || userAttributes.given_name || cognitoUser.username || 'New User',
            email: userAttributes.email || '',
            phoneNumber: userAttributes.phone_number || '',
            role: userRole,
          }).unwrap();
          
          refetch();
        } catch (createError) {
          console.error('Failed to create user:', createError);
        }
      }
    };
    
    handleUserCreation();
  }, [user, error, isLoading, authUser, createUser, refetch]);

  if (user && (isLoading || isCreating)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p>Setting up your account...</p>
        </div>
      </div>
    );
  }

  if (user && error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center text-red-500">
          <p>Failed to sync account. Please try refreshing the page.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

const Auth = ({ children }: { children: React.ReactNode }) => {
  const { user: amplifyUser } = useAuthenticator((context) => [context.user]);
  const router = useRouter();
  const pathname = usePathname();

  const isAuthPage = pathname.match(/^\/(signin|signup)$/);
  const isDashboardPage =
    pathname.startsWith("/user") ||
    pathname.startsWith("/creator") ||
    pathname.startsWith("/admin");

  // For non-auth and non-dashboard pages, just return children with DatabaseSync
  if (!isAuthPage && !isDashboardPage) {
    return (
      <DatabaseSync>
        {children}
      </DatabaseSync>
    );
  }

  // For auth pages or dashboard pages, use the custom auth component
  return (
    <CustomAuth key={amplifyUser?.userId || 'unauthenticated'}>
      <DatabaseSync>
        {children}
      </DatabaseSync>
    </CustomAuth>
  );
};

export default Auth;