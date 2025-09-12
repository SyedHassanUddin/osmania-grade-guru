import { useState } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Loader2, Calculator, GraduationCap, TrendingUp, AlertTriangle } from "lucide-react";

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
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setResult(null);
    
    try {
      // Note: Replace with your actual FastAPI backend URL
      const response = await fetch('/api/fetch_results', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ hallticket }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setResult(data);
      
      toast({
        title: "Results fetched successfully",
        description: `GPA: ${data.gpa.toFixed(2)}`,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch results';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'O': return 'bg-gradient-accent text-accent-foreground';
      case 'A+': case 'A': return 'bg-success text-success-foreground';
      case 'B': return 'bg-primary text-primary-foreground';
      case 'C': return 'bg-warning text-warning-foreground';
      case 'P': return 'bg-secondary text-secondary-foreground';
      case 'F': return 'bg-destructive text-destructive-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-secondary p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-3">
            <GraduationCap className="h-10 w-10 text-primary" />
            <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Osmania University GPA Calculator
            </h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Enter your hall ticket number to calculate your GPA and view results
          </p>
        </div>

        {/* Input Form */}
        <Card className="shadow-medium">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calculator className="h-5 w-5" />
              <span>Enter Hall Ticket Details</span>
            </CardTitle>
            <CardDescription>
              Enter your hall ticket number to fetch your academic results
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="hallticket">Hall Ticket Number</Label>
                <Input
                  id="hallticket"
                  type="text"
                  value={hallticket}
                  onChange={(e) => setHallticket(e.target.value)}
                  placeholder="160423737303"
                  required
                  className="text-lg"
                />
              </div>
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-primary hover:opacity-90 transition-opacity"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Fetching Results...
                  </>
                ) : (
                  <>
                    <TrendingUp className="mr-2 h-4 w-4" />
                    Calculate GPA
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Error Display */}
        {error && (
          <Card className="border-destructive shadow-medium">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2 text-destructive">
                <AlertTriangle className="h-5 w-5" />
                <span className="font-medium">Error: {error}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Results Display */}
        {result && (
          <div className="space-y-6">
            {/* GPA Summary */}
            <Card className="shadow-strong bg-gradient-primary text-primary-foreground">
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <h2 className="text-3xl font-bold">Your GPA</h2>
                  <div className="text-6xl font-bold">{result.gpa.toFixed(2)}</div>
                  {result.backlogs.length > 0 && (
                    <div className="flex items-center justify-center space-x-2">
                      <AlertTriangle className="h-5 w-5" />
                      <span>Backlogs: {result.backlogs.length}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Backlogs */}
            {result.backlogs.length > 0 && (
              <Card className="shadow-medium">
                <CardHeader>
                  <CardTitle className="text-destructive flex items-center space-x-2">
                    <AlertTriangle className="h-5 w-5" />
                    <span>Backlog Subjects</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {result.backlogs.map((subject, index) => (
                      <Badge key={index} variant="destructive">
                        {subject}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Subject Details */}
            <Card className="shadow-medium">
              <CardHeader>
                <CardTitle>Subject-wise Results</CardTitle>
                <CardDescription>
                  Detailed breakdown of all subjects and grades
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-2">Subject Code</th>
                        <th className="text-left py-3 px-2">Subject Name</th>
                        <th className="text-center py-3 px-2">Credits</th>
                        <th className="text-center py-3 px-2">Grade</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.subjects.map((subject, index) => (
                        <tr key={index} className="border-b">
                          <td className="py-3 px-2 font-mono">{subject.code}</td>
                          <td className="py-3 px-2">{subject.name}</td>
                          <td className="py-3 px-2 text-center">{subject.credits}</td>
                          <td className="py-3 px-2 text-center">
                            <Badge className={getGradeColor(subject.grade)}>
                              {subject.grade}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Backend Note */}
        <Card className="shadow-soft bg-muted">
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground">
              <p className="font-medium mb-2">Note for Backend Implementation:</p>
              <p>This frontend is designed to work with your FastAPI backend. The current implementation makes requests to <code>/api/fetch_results</code>. 
              Since Lovable can't run Python backends, consider implementing the scraping logic using Supabase Edge Functions as an alternative.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};