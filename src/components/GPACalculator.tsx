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
        if (response.status === 400) {
          toast({
            title: "Invalid Hall Ticket",
            description: "Invalid Hall Ticket. Please try again.",
            variant: "destructive",
          });
        } else if (response.status >= 500) {
          toast({
            title: "Server Error",
            description: "Server busy. Try later.",
            variant: "destructive",
          });
        } else {
          throw new Error('Failed to fetch results');
        }
        return;
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      toast({
        title: "Connection Error",
        description: "Server busy. Try later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-between px-4 py-8">
      <div className="flex-1 flex flex-col items-center justify-center w-full">
        {/* Header */}
        {!result && (
          <div className="w-full max-w-md text-center mb-8">
            <h1 className="text-4xl sm:text-6xl font-light text-foreground mb-8">GPA</h1>
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
                  className="w-full h-12 sm:h-14 px-4 sm:px-6 text-base sm:text-lg border-2 rounded-full focus:ring-2 focus:ring-primary focus:border-transparent"
                  maxLength={12}
                />
              </div>
              <div className="flex justify-center">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="px-6 sm:px-8 py-2 sm:py-3 text-sm rounded-md hover:shadow-md transition-shadow"
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
          <div className="w-full max-w-4xl space-y-6 sm:space-y-8">
            {/* Back to search */}
            <div className="text-center">
              <Button
                variant="outline"
                onClick={() => setResult(null)}
                className="mb-4 sm:mb-6"
              >
                ← New Search
              </Button>
            </div>

            {/* GPA Display */}
            <div className="text-center">
              <div className="text-4xl sm:text-6xl font-bold text-foreground mb-2">
                {result.gpa.toFixed(2)}
              </div>
              <div className="text-base sm:text-lg text-muted-foreground">Your GPA</div>
            </div>

            {/* Backlogs */}
            {result.backlogs.length > 0 && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 sm:p-4">
                <h3 className="font-semibold text-destructive mb-2 sm:mb-3 text-sm sm:text-base">
                  Backlog Subjects ({result.backlogs.length})
                </h3>
                <div className="space-y-1">
                  {result.backlogs.map((subject, index) => (
                    <div key={index} className="text-destructive font-medium text-sm sm:text-base">
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
                      <th className="text-left p-2 sm:p-4 font-medium text-xs sm:text-sm">Subject Code</th>
                      <th className="text-left p-2 sm:p-4 font-medium text-xs sm:text-sm">Subject Name</th>
                      <th className="text-center p-2 sm:p-4 font-medium text-xs sm:text-sm">Credits</th>
                      <th className="text-center p-2 sm:p-4 font-medium text-xs sm:text-sm">Grade</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.subjects.map((subject, index) => (
                      <tr key={index} className="border-t">
                        <td className="p-2 sm:p-4 font-mono text-xs sm:text-sm">{subject.code}</td>
                        <td className="p-2 sm:p-4 text-xs sm:text-sm">{subject.name}</td>
                        <td className="p-2 sm:p-4 text-center text-xs sm:text-sm">{subject.credits}</td>
                        <td className="p-2 sm:p-4 text-center">
                          <span className={`inline-block px-2 sm:px-3 py-1 rounded text-xs sm:text-sm font-medium ${
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

      {/* Disclaimer */}
      <div className="w-full max-w-4xl mt-8 pt-4 border-t border-border">
        <p className="text-center text-xs sm:text-sm text-muted-foreground">
          This tool fetches data from OU portal in real time. No data is stored.
        </p>
      </div>
    </div>
  );
};