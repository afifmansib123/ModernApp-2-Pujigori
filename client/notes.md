# PujiGori FrontEnd Implementation Guide

## 🎯 Notes 

### Chapter1 : Initial Project Setup (3.1 to 3.3 commits)

**Tailwind Shandcn and UI related**

1. dragged the resources folder to make life easy.
2. install dependencies : npm i lucide-react dotenv date-fns react-filepond filepond filepond-plugin-image-exif-orientation filepond-plugin-image-preview framer-motion mapbox-gl lodash react-hook-form zod @hookform/resolvers
3. install tailwind : npm install -D tailwindcss@^3 postcss autoprefixer npx tailwindcss init -p 
4. initiate tailwind : npx tailwindcss init -p
5. dragged files : global.css to app folder , tailwind.config.ts and tsconfig.json to root. deleted tailwind.config.js.
6. install shadcn components : npx shadcn@latest add avatar badge button card checkbox command dialog dropdown-menu form input label navigation-menu radio-group select separator sheet sidebar skeleton slider switch table tabs textarea tooltip
7. copied the constants to lib folder. 


### Chapter2 : RTK (Commit 3.4)

1. install : npm install @reduxjs/toolkit react-redux
2. copied the state folder -> has all redux toolkit files. 
3. wrote the providers file in src and wrapped layout in that.
4. NEXT_PUBLIC_API_BASE_URL = localhost,nodejs address.

### Chapter3 : UI (UI Setup)

1. Created nondashboard landing page and layouts. (commit 4.1)
2. created The Navbar , Copied Code , put it in landing page. (commit 4.1)
3. framer motion install -> npm install framer-motion (Commit 4.2)
4. made - HeroSection , FeatureSection and CalltoActionSection (Commit 4.2)
5. instlled fontawesome for footer and copied footer. -> npm i @fortawesome/fontawesome-svg-core @fortawesome/free-brands-svg-icons @fortawesome/react-fontawesome --legacy-peer-deps (Commit 4.2)

### Chapter4 : Authentication 

Commit 5.0 - Setup

1. installed aws amplify : npm i aws-amplify @aws-amplify/ui-react
2. created the authprovider.tsx file and (auth) routes.
3. created the env vars : NEXT_PUBLIC_AWS_COGNITO_USER_POOL_ID=
NEXT_PUBLIC_AWS_COGNITO_USER_POOL_CLIENT_ID=
4. went to Provider.tsx and wrapped the app with AuthProvider
5. modified the authprovider.tsx file to work with user types and other modifications.


Commit 5.1 - Real Authentication - Look at Every Code in This Comment Carefully 
A very Difficult authentication / debugging process check all files. commit - 5.1

1. fixed some typos in api.ts in state folder.
2. created authUtils.ts -> create user in database function -> called backend api at : "/auth/create-user"
3. edited api.ts -> getuser info from endpoint : "/auth/profile/${userId}", create user if needed.
4. edited authProvider.tsx to match with new setup.
5. in nodejs -> fixed AuthController.ts in controllers and auth.ts in middlewares.

Commit 5.2 - 2 rtk apis for getting the users : a. getAllUsers : at state/api and
endpoint is at routes/auth.ts : /auth/users
b. updateUserRole : at state/api and endpoint for node js at : /auth/users/${userId}/role

Commit 5.3 - Project Related APIs

2 rtk apis : a. getProjectsByCreator -> pointig to getProjectsByCreator in projectcontrollers.
b. createProject -> POST project api for controllers : createProject.

Commit 5.3 (Backend) - Had to Edit the project routes and import necessary  userMiddleware . then had to create project adn get project.
some minor changes had to be done. 

Commit 5.4 - AWS S3 Upload Files - ACL - Access Control List was beeing a problem , changed it to AWS setting to rely on bucket level public access
    a. created ploadMultipleFiles in RTK.
    b. in routes , upload routes imported creatorMiddleware .
    c. from upload controllers to uploadMultiple -> rechecked the code.
    d. main S3 configuration is in services -> S3Service. had to edit the ACL there. 

Commit 5.5 - Completing all api related to Projects
    a. getTrendingProjects
    b. getProjectsByCategory
    c. getProject -> use slug to get every project , includes donation info as well
    d. updateProject -> if creator id matches logged in id
    e. deleteProject -> delete project by id
    f. getProjectUpdates -> what updates have been done to the project
    g. addProjectUpdate -> add more details to the project
    h. getProjectStats -> get project related statistics.
    g. getProject stats -> /api/projects/:id/stats , inputting the project mongodb id here we get all donation related stats check 
    look at controller changes. there was some private method related issues. 

Commit 5.6 - First Payment Related Test API : InitiatePayment

    a. created the initiatepayment endpont. had to manually make project status active to accept payments. 
    store details : gmail account of zianmansib123@gmai.com
    check BLOCKERS.md for debug info

Commit 5.7 - All Payment APIs

    a. getPaymentMethods: what kind of payments for the whole app-> credit/debits or mobile banking etc.
    b. getPaymentStatus : get payment status , status and data of certain transactions. use this to check payment status .
    c. GetPaymentStatistics : get payment related statisctics -> used for masteradmin only and has
    to be authenticated using middleware.
    d. InitiateRefund -> Admin can claim the refund using sslcommerce built in function.
    e. VerifyPayment -> Admin can verifyPayment.
** TO Do : 2 apis cant be tested yet (InitiateRefund, VarifyPayment)

Commit 5.8 - All Donation APIs
    a.GetDonations -> get all donations
    b.GetDonationQuery -> get donations by id
    c.GetProjectDonations -> get donations of each project.
    d.GetUserDonations -> get user's donations.
    e.GetRecentDonations -> recent donations made.
    f.GetDonationQRQuery -> get QR code generated by donations.
    g.RedeemReward -> redeem the reward of a donation
    h.GetPendingRewards -> get pending rewards.
    i.GetDonationStatistics -> All Donation statistics.
    j.UpdateDonorMessage -> update message of donations.

** TO Do : Test Page is there but cannot test all api as there is no donations yet.

Commit 5.11 , 5.12 - accidentally skipped 2 commit numbers. but these 2 commits were mostly testing and fixing.
so far test results are well. going to start implementing ui now.


commit 6.0 - First UI - Navbar
RTK - useGetAuthUserQuery , 
AWS amplify - useGetAuthUserQuery
aws-amplify/auth - signOut
UI - dropdown-menu , avatar , Button

commit 6.1 - HeroSection : A lot of animation (check motion.md)

commit 6.2 - All Sections for Home page : latest had to install carasoel : npx shadcn@latest add carousel. Read All codes in 
other sections for all css work. 
