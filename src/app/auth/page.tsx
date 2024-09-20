"use client";

import React from "react";
import { useSearchParams } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const LoginPage = () => {
  const params = useSearchParams();
  const next = params.get("next") || "";

  const handleLoginWithOAuth = (provider: "github" | "google") => {
    const supabase = supabaseBrowser();
    supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: location.origin + "/auth/callback?next=" + next,
      },
    });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-160px)] px-4">
      <div className="w-full max-w-[360px] space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-semibold mb-2">Sign In</h1>
          <p className="text-sm text-gray-500">Welcome, we'll secure your Solidity smart contracts!</p>
        </div>
        
        <div className="space-y-3">
          <Button
            variant="secondary"
            className="w-full justify-start font-normal" 
            onClick={() => handleLoginWithOAuth("github")}
          >
            <img src="/metamask.png" alt="MetaMask logo" className="mr-2 h-5 w-5" />
            Continue with MetaMask
          </Button>
          <Button 
            variant="secondary"
            className="w-full justify-start font-normal " 
            onClick={() => handleLoginWithOAuth("google")}
          >
            <img src="/google.png" alt="Google logo" className="mr-2 h-5 w-5" />
            Continue with Google
          </Button>
          <Button 
            variant="secondary"
            className="w-full justify-start font-normal " 
            onClick={() => handleLoginWithOAuth("github")}
          >
            <img src="/github.png" alt="Google logo" className="mr-2 h-5 w-5" />
            Continue with GitHub
          </Button>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-gray-500">Or</span>
          </div>
        </div>

        <div className="space-y-3">
          <Input type="email" placeholder="Your email" className="w-full" />
          <Input type="password" placeholder="Password" className="w-full" />
        </div>

        <div className="text-right">
          <a href="#" className="text-sm hover:underline">Forgot Password?</a>
        </div>

        <Button className="w-full bg-gradient-to-r from-blue-900 to-blue-800 text-white transition-all duration-300 hover:opacity-70">
          Sign In
        </Button>

        <p className="text-sm text-center text-gray-500">
          Don't have an account yet? <a href="#" className="text-blue-500 hover:underline">Sign up</a>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;