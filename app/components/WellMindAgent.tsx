"use client";

import { useEffect } from "react";

export default function WellMindAgent() {
  useEffect(() => {
    // Step 1: Inject the IBM configuration object
    (window as any).wxOConfiguration = {
      orchestrationID:
        "20251122-1414-1898-608f-76b80d3d94bb_20251122-1415-2862-203e-820f3992862f",
      hostURL: "https://ap-southeast-1.dl.watson-orchestrate.ibm.com",
      rootElementID: "root",
      chatOptions: {
        agentId: "b0018750-9021-43a6-b70f-cf7a41e89aa9",
      },
    };

    // Step 2: Load the IBM WXO loader script dynamically
    const script = document.createElement("script");
    script.src = `${(window as any).wxOConfiguration.hostURL}/wxochat/wxoLoader.js?embed=true`;
    script.onload = () => {
      if ((window as any).wxoLoader) {
        (window as any).wxoLoader.init();
      } else {
        console.error("wxoLoader failed to load.");
      }
    };
    document.head.appendChild(script);

    return () => {
      // Clean up if the user navigates away
      document.head.removeChild(script);
    };
  }, []);

  return (
    <div
      id="root"
      style={{
        width: "100%",
        height: "80vh",
        border: "1px solid #e5e5e5",
        borderRadius: "12px",
        overflow: "hidden",
      }}
    />
  );
}
