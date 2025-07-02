import React from "react";
import { checkUser } from "@/lib/checkUser";

const MainLayout = async ({ children }) => {
  // Ensure user exists in database
  await checkUser();

  return <div className="container mx-auto mt-24 mb-20">{children}</div>;
};

export default MainLayout;
