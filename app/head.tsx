export default function Head() {
  return (
    <>
      {/* Speed up first connection to IBM domain */}
      <link
        rel="preconnect"
        href="https://ap-southeast-1.dl.watson-orchestrate.ibm.com"
        crossOrigin="anonymous"
      />
      <link
        rel="dns-prefetch"
        href="https://ap-southeast-1.dl.watson-orchestrate.ibm.com"
      />
      {/* Best-effort preload; ignored if server doesn't allow */}
      <link
        rel="preload"
        as="script"
        href="https://ap-southeast-1.dl.watson-orchestrate.ibm.com/wxochat/wxoLoader.js?embed=true"
        crossOrigin="anonymous"
      />
    </>
  );
}
