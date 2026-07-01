import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f0f2fa] p-4">
      <SignUp 
        appearance={{
          variables: {
            colorPrimary: "#6b46c1",
          },
          elements: {
            card: "shadow-xl border border-purple-100 rounded-2xl",
          }
        }}
      />
    </div>
  );
}
