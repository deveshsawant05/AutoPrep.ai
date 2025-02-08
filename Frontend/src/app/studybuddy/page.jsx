"use client"

import { useState } from "react";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { MessageCircle, Upload, Bot } from "lucide-react";
import ReactMarkdown from "react-markdown";
export default function StudyBuddy() {
  const [doubt, setDoubt] = useState("");
  const [file, setFile] = useState(null);
  const [response, setResponse] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      setFile(event.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (!doubt.trim() && !file) return;
    setIsLoading(true);
    const formData = new FormData();
    formData.append("doubt", doubt);
    if (file) formData.append("file", file);

    try {
      const res = await fetch("/api/studybuddy", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      setResponse(data.response);
    } catch (error) {
      console.error("Error submitting doubt:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <div className="p-8">
        <div className="max-w-3xl mx-auto space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bot className="mr-2 h-6 w-6 text-accent" />
                Ask StudyBuddy
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <Textarea
                placeholder="Type your doubt here..."
                value={doubt}
                onChange={(e) => setDoubt(e.target.value)}
                className="min-h-[150px]"
              />

              <div className="space-y-4">
                <Button
                  className="w-full bg-accent hover:bg-accent-dark"
                  onClick={handleSubmit}
                  disabled={isLoading || (!doubt.trim() && !file)}
                >
                  {isLoading ? "Submitting..." : (
                    <>
                      <MessageCircle className="mr-2 h-4 w-4" /> Submit Doubt
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
          {/* Chat Response */}
          {response && (
            <Card>
              <CardHeader>
                <CardTitle>StudyBuddy's Response</CardTitle>
              </CardHeader>
              <CardContent>
                <ReactMarkdown className="prose">{response}</ReactMarkdown>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </main>
  );
}
