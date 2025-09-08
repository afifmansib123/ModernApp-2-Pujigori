import React from "react";
import { Amplify } from "aws-amplify";
import {
  Authenticator,
  View,
  Heading,
  useAuthenticator,
  RadioGroupField,
  Radio,
} from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { useGetAuthUserQuery, useCreateUserMutation , } from "@/state/api";

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: process.env.NEXT_PUBLIC_AWS_COGNITO_USER_POOL_ID!,
      userPoolClientId:
        process.env.NEXT_PUBLIC_AWS_COGNITO_USER_POOL_CLIENT_ID!,
    },
  },
});

// Database sync component
// Database sync component
function DatabaseSync({ children }: { children: React.ReactNode }) {
  const { user } = useAuthenticator((context) => [context.user]);
  const { data: authUser, isLoading, error, refetch } = useGetAuthUserQuery(undefined, {
    skip: !user, // Only run when user exists
  });
  const [createUser, { isLoading: isCreating }] = useCreateUserMutation();

  // PUT THE useEffect HERE - replace your existing useEffect
useEffect(() => {
  const handleUserCreation = async () => {
    if (!user || isLoading || authUser) return;
    
    // Check if error indicates user needs to be created
    if (error && (error as any)?.status === "USER_NOT_IN_DB") {
      const cognitoUser = (error as any).cognitoUser;
      const userRole = (error as any).userRole;
      
      try {
        // Import fetchUserAttributes here
        const { fetchUserAttributes } = await import('aws-amplify/auth');
        const userAttributes = await fetchUserAttributes();
        
        await createUser({
          cognitoId: cognitoUser.userId,
          name: userAttributes.name || userAttributes.given_name || cognitoUser.username || 'New User',
          email: userAttributes.email || '',
          phoneNumber: userAttributes.phone_number || '',
          role: userRole,
        }).unwrap();
        
        // Refetch to get the created user
        refetch();
      } catch (createError) {
        console.error('Failed to create user:', createError);
      }
    }
  };
  
  handleUserCreation();
}, [user, error, isLoading, authUser, createUser, refetch]);

  // Show loading state while syncing user data
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

  // Show error if sync failed
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

const components = {
  Header() {
    return (
      <View className="mt-4 mb-7">
        <Heading level={3} className="!text-2xl !font-bold">
          Puji
          <span className="text-green-900 font-light hover:!text-primary-300">
            Gori
          </span>
        </Heading>
        <p className="text-muted-foreground mt-2">
          <span className="font-bold">Welcome!</span> Please sign in to continue
        </p>
      </View>
    );
  },
  SignIn: {
    Footer() {
      const { toSignUp } = useAuthenticator();
      return (
        <View className="text-center mt-4">
          <p className="text-muted-foreground">
            Don&apos;t have an account?{" "}
            <button
              onClick={toSignUp}
              className="text-primary hover:underline bg-transparent border-none p-0"
            >
              Sign up here
            </button>
          </p>
        </View>
      );
    },
  },
  SignUp: {
    FormFields() {
      const { validationErrors } = useAuthenticator();

      return (
        <>
          <Authenticator.SignUp.FormFields />
          <RadioGroupField
            legend="Role"
            name="custom:role"
            errorMessage={validationErrors?.["custom:role"]}
            hasError={!!validationErrors?.["custom:role"]}
            isRequired
          >
            <Radio value="user">Investor</Radio>
            <Radio value="creator">Project Creator</Radio>
            <Radio value="admin">MasterAdmin</Radio>
          </RadioGroupField>
        </>
      );
    },

    Footer() {
      const { toSignIn } = useAuthenticator();
      return (
        <View className="text-center mt-4">
          <p className="text-muted-foreground">
            Already have an account?{" "}
            <button
              onClick={toSignIn}
              className="text-primary hover:underline bg-transparent border-none p-0"
            >
              Sign in
            </button>
          </p>
        </View>
      );
    },
  },
};

const formFields = {
  signIn: {
    username: {
      placeholder: "Enter your email",
      label: "Email",
      isRequired: true,
    },
    password: {
      placeholder: "Enter your password",
      label: "Password",
      isRequired: true,
    },
  },
  signUp: {
    username: {
      order: 1,
      placeholder: "Choose a username",
      label: "Username",
      isRequired: true,
    },
    email: {
      order: 2,
      placeholder: "Enter your email address",
      label: "Email",
      isRequired: true,
    },
    password: {
      order: 3,
      placeholder: "Create a password",
      label: "Password",
      isRequired: true,
    },
    confirm_password: {
      order: 4,
      placeholder: "Confirm your password",
      label: "Confirm Password",
      isRequired: true,
    },
  },
};

const Auth = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuthenticator((context) => [context.user]);
  const router = useRouter();
  const pathname = usePathname();

  const isAuthPage = pathname.match(/^\/(signin|signup)$/);
  const isDashboardPage =
    pathname.startsWith("/user") ||
    pathname.startsWith("/creator") ||
    pathname.startsWith("/admin");

  useEffect(() => {
    if (user && isAuthPage) {
      router.push("/");
    }
  }, [user, isAuthPage, router]);

  if (!isAuthPage && !isDashboardPage) {
    return (
      <DatabaseSync>
        {children}
      </DatabaseSync>
    );
  }

  return (
    <Authenticator 
      initialState={pathname.includes("signup") ? "signUp" : "signIn"}
      formFields={formFields}
      components={components}
    >
      <DatabaseSync>
        {children}
      </DatabaseSync>
    </Authenticator>
  );
};

export default Auth;