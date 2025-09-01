import { useEffect } from "react";
import { Link } from "react-router-dom";

const Index = () => {
  // Inject <meta name="viewport"> once at runtime (works without index.html)
  useEffect(() => {
    let tag = document.querySelector('meta[name="viewport"]') as HTMLMetaElement | null;
    if (!tag) {
      tag = document.createElement("meta");
      tag.setAttribute("name", "viewport");
      document.head.appendChild(tag);
    }
    // Best practice: device-width + initial-scale; viewport-fit for safe areas
    tag.setAttribute("content", "width=device-width, initial-scale=1, viewport-fit=cover");
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Center + cap width: 80vw but never exceed Tailwind's 2xl for readability */}
      <div className="mx-auto w-[80vw] max-w-screen-2xl px-4 lg:px-6 py-8">
        {/* Fallback / landing content; keep theme classes untouched */}
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Welcome to Your App</h1>
          <p className="text-xl text-muted-foreground mb-6">
            Start building your amazing project here!
          </p>
          <Link
            to="/dashboard"
            className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-primary-foreground hover:opacity-90 transition"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Index;
