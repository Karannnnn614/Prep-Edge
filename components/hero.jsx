"use client";

import React, { useEffect, useRef } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion } from "framer-motion";

const HeroSection = () => {
  const imageRef = useRef(null);

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6 }
    }
  };

  const staggerChildren = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  return (
    <section className="w-full pt-36 md:pt-48 pb-10">
      <motion.div 
        initial="hidden"
        animate="visible"
        variants={staggerChildren}
        className="space-y-6 text-center"
      >
        <motion.div 
          variants={fadeIn}
          className="space-y-6 mx-auto"
        >
          <h1 className="text-5xl font-bold md:text-6xl lg:text-7xl xl:text-8xl gradient-title animate-gradient">
            Your AI Career Coach for
            <br />
            Professional Success
          </h1>
          <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl">
            Advance your career with personalized guidance, interview prep, and
            AI-powered tools for job success.
          </p>
        </motion.div>

        <motion.div 
          variants={fadeIn}
          className="flex justify-center space-x-4"
        >
          <Link href="/dashboard">
            <Button size="lg" className="px-8 hover:scale-105 transition-transform">
              Get Started
            </Button>
          </Link>
          <Link href="">
            <Button size="lg" variant="outline" className="px-8 hover:scale-105 transition-transform">
              Watch Demo
            </Button>
          </Link>
        </motion.div>

        <motion.div 
          variants={fadeIn}
          className="hero-image-wrapper mt-5 md:mt-0"
        >
          <motion.div 
            ref={imageRef}
            className="hero-image"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Image
              src="/banner4.jpg"
              width={1280}
              height={720}
              alt="Dashboard Preview"
              className="rounded-lg shadow-2xl border mx-auto"
              priority
            />
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default HeroSection;