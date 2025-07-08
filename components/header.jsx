import React from "react";
import Link from "next/link";
import Image from "next/image";
import HeaderClient from "./header-client";

export default function Header() {
  return (
    <header className="fixed top-0 w-full border-b bg-background/80 backdrop-blur-md z-50 supports-[backdrop-filter]:bg-background/60">
      <nav className="container mx-auto px-4 h-14 flex items-center justify-between bg-white/15">
        <Link href="/">
          <Image
            src={"/logo.png"}
            alt="PrepEdge Logo"
            width={200}
            height={60}
            className="h-20 w-auto object-contain"
            priority
          />
        </Link>
        {/* Client-side authentication components */}
        <HeaderClient />
      </nav>
    </header>
  );
}
