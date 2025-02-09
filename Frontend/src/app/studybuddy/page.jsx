"use client"

import { useState } from "react"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { MessageCircle, Upload, Bot } from "lucide-react"

import ReactMarkdown from "react-markdown"
import remarkMath from "remark-math"
import rehypeKatex from "rehype-katex"
import "katex/dist/katex.min.css"

export default function StudyBuddy() {
  const [doubt, setDoubt] = useState("")
  const [response, setResponse] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [chatHistory, setChatHistory] = useState([])

  const handleSubmit = async () => {
    setIsLoading(true)
    setResponse("") // Clear previous response
    try {
      const formData = new FormData()
      formData.append("doubt", `Chat History: ${chatHistory.join("\n")}\nNew Prompt: ${doubt}`)

      const res = await fetch("/api/studybuddy", {
        method: "POST",
        body: formData,
      })

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`)
      }

      const data = await res.json()

      if (data?.res?.reply) {
        const formattedReply = data.res.reply
          // Convert inline LaTeX expressions \( ... \) to $...$
          .replace(/\\\((.*?)\\\)/g, '$$$1$')
          // Convert block LaTeX expressions \[ ... \] to $$ ... $$
          .replace(/\\\[(.*?)\\\]/gs, '$$\n$1\n$$')
          // Fix subscripts (e.g., x_1 -> x_{1})
          .replace(/(\w)_(\w+)/g, '$1_{$2}')
        
        setResponse(formattedReply)      
        setChatHistory([...chatHistory, `You: ${doubt}`, `StudyBuddy: ${formattedReply}`])
      } else {
        setResponse("No response received from the API.")
      }
    } catch (error) {
      console.error("Error submitting doubt:", error)
      setResponse("An error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

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
                  disabled={!doubt.trim() || isLoading}
                >
                  {isLoading ? "Submitting..." : (
                    <>
                      <MessageCircle className="mr-2 h-4 w-4" />
                      Submit Doubt
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {response && (
            <Card>
              <CardHeader>
                <CardTitle>StudyBuddy's Response</CardTitle>
              </CardHeader>
              <CardContent>
                <ReactMarkdown
                  className="max-w-none"
                    remarkPlugins={[remarkMath]}
                    rehypePlugins={[rehypeKatex]}
                >
                  {response}
                </ReactMarkdown>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Previous Conversations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {chatHistory.slice(0, -1).reverse().map((message, index) => (
                  <div key={index} className="flex space-x-3">
                    <div className="flex-shrink-0">
                      {message.startsWith("You:") ? (
                        <Upload className="h-6 w-6 text-accent" />
                      ) : (
                        <Bot className="h-6 w-6 text-accent" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{message.startsWith("You:") ? "You" : "StudyBuddy"}</p>
                      <ReactMarkdown
                        className="text-muted-foreground"
                        remarkPlugins={[remarkMath]}
                        rehypePlugins={[rehypeKatex]}
                      >
                        {message.replace(/^(You:|StudyBuddy:)\s*/, "")}
                      </ReactMarkdown>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}

