import { IconBrandTailwind } from '@tabler/icons-react';

function App() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-background to-muted p-4 text-foreground">
      <div className="flex flex-col items-center justify-center gap-6 rounded-lg border border-border bg-card p-8 shadow-lg">
        <IconBrandTailwind className="h-16 w-16 text-primary" />
        
        <h1 className="text-3xl font-bold">PACTA</h1>
        
        <p className="text-center text-muted-foreground">
          Modern application built with React, TailwindCSS and TypeScript
        </p>
        
        <div className="mt-4 flex gap-4">
          <button className="rounded-md bg-primary px-4 py-2 text-primary-foreground shadow transition-colors hover:bg-primary/90">
            Get Started
          </button>
          <button className="rounded-md border border-border bg-card px-4 py-2 shadow transition-colors hover:bg-muted">
            Learn More
          </button>
        </div>
      </div>
    </div>
  );
}

export default App; 