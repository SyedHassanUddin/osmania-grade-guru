import { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";

interface Subject {
  code: string;
  name: string;
  credits: number;
  grade: string;
}

interface GPAResult {
  gpa: number;
  backlogs: string[];
  subjects: Subject[];
}

export const GPACalculator = () => {
  const { toast } = useToast();
  const [hallticket, setHallticket] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<GPAResult | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setResult(null);
    
    try {
      const response = await fetch('/fetch_results', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ hallticket }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch results');
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to fetch results. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8">
      {/* Header */}
      {!result && (
        <div className="w-full max-w-md text-center mb-8">
          <h1 className="text-6xl font-light text-foreground mb-8">GPA</h1>
        </div>
      )}

      {/* Search Form */}
      {!result && (
        <div className="w-full max-w-md">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
              <Input
                type="text"
                value={hallticket}
                onChange={(e) => setHallticket(e.target.value)}
                placeholder="Enter your 12-digit Hall Ticket Number"
                required
                className="w-full h-14 px-6 text-lg border-2 rounded-full focus:ring-2 focus:ring-primary focus:border-transparent"
                maxLength={12}
              />
            </div>
            <div className="flex justify-center space-x-4">
              <Button
                type="submit"
                disabled={isLoading}
                className="px-8 py-3 text-sm rounded-md hover:shadow-md transition-shadow"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Checking...
                  </>
                ) : (
                  'Check GPA'
                )}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="w-full max-w-4xl space-y-8">
          {/* Back to search */}
          <div className="text-center">
            <Button
              variant="outline"
              onClick={() => setResult(null)}
              className="mb-6"
            >
              ← New Search
            </Button>
          </div>

          {/* GPA Display */}
          <div className="text-center">
            <div className="text-6xl font-bold text-foreground mb-2">
              {result.gpa.toFixed(2)}
            </div>
            <div className="text-lg text-muted-foreground">Your GPA</div>
          </div>

          {/* Backlogs */}
          {result.backlogs.length > 0 && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
              <h3 className="font-semibold text-destructive mb-3">
                Backlog Subjects ({result.backlogs.length})
              </h3>
              <div className="space-y-1">
                {result.backlogs.map((subject, index) => (
                  <div key={index} className="text-destructive font-medium">
                    {subject}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Subjects Table */}
          <div className="bg-card border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted">
                  <tr>
                    <th className="text-left p-4 font-medium">Subject Code</th>
                    <th className="text-left p-4 font-medium">Subject Name</th>
                    <th className="text-center p-4 font-medium">Credits</th>
                    <th className="text-center p-4 font-medium">Grade</th>
                  </tr>
                </thead>
                <tbody>
                  {result.subjects.map((subject, index) => (
                    <tr key={index} className="border-t">
                      <td className="p-4 font-mono text-sm">{subject.code}</td>
                      <td className="p-4">{subject.name}</td>
                      <td className="p-4 text-center">{subject.credits}</td>
                      <td className="p-4 text-center">
                        <span className={`inline-block px-3 py-1 rounded text-sm font-medium ${
                          subject.grade === 'F' 
                            ? 'bg-destructive text-destructive-foreground'
                            : 'bg-primary text-primary-foreground'
                        }`}>
                          {subject.grade}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};