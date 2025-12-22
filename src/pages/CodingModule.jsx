import React, { useState, useEffect } from "react";
import { 
  Play, Send, CheckCircle, XCircle, 
  Code as CodeIcon, Cpu, Clock, Terminal, AlertTriangle 
} from "lucide-react";
import { supabase } from "../supabaseClient";

// --- 1. PROBLEM DATA (With Hidden Test Cases) ---
const PROBLEMS = [
  {
    id: 1,
    title: "Sum of Two Numbers",
    difficulty: "Easy",
    description: "Write a program that reads two integers from standard input (stdin) and prints their sum to standard output (stdout).",
    testCases: [
      { input: "5 10", expected: "15" },
      { input: "-3 3", expected: "0" }, 
      { input: "100 200", expected: "300" } 
    ],
    starterCode: {
      java: `import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner scanner = new Scanner(System.in);\n        if (scanner.hasNextInt()) {\n            int a = scanner.nextInt();\n            int b = scanner.nextInt();\n            // Write your logic here\n            System.out.println(a + b);\n        }\n    }\n}`,
      python: `import sys\n\n# Read from stdin\ninput_data = sys.stdin.read().split()\nif len(input_data) >= 2:\n    a = int(input_data[0])\n    b = int(input_data[1])\n    \n    # Write logic here\n    print(a + b)`,
      cpp: `#include <iostream>\nusing namespace std;\n\nint main() {\n    int a, b;\n    if (cin >> a >> b) {\n        cout << (a + b);\n    }\n    return 0;\n}`
    }
  },
  {
    id: 2,
    title: "Check Even or Odd",
    difficulty: "Easy",
    description: "Read a single integer from input. If it is even, print 'Even'. If it is odd, print 'Odd'.",
    testCases: [
      { input: "4", expected: "Even" },
      { input: "7", expected: "Odd" },
      { input: "0", expected: "Even" }
    ],
    starterCode: {
      java: `import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner scanner = new Scanner(System.in);\n        int n = scanner.nextInt();\n        // Write logic here\n        \n    }\n}`,
      python: `import sys\n\n# Read input\nn = int(sys.stdin.read())\n# Write logic here\n`,
      cpp: `#include <iostream>\nusing namespace std;\n\nint main() {\n    int n;\n    cin >> n;\n    // Write logic here\n    return 0;\n}`
    }
  }
];

// --- 2. LANGUAGE CONFIG FOR API ---
const LANGUAGE_VERSIONS = {
  java: { language: "java", version: "15.0.2", file: "Main.java" },
  python: { language: "python", version: "3.10.0", file: "main.py" },
  cpp: { language: "c++", version: "10.2.0", file: "main.cpp" }
};

// ✅ 1. Accept sessionId prop
const CodingModule = ({ user, sessionId, onComplete, onCancel }) => {
  const [problem, setProblem] = useState(PROBLEMS[0]);
  const [language, setLanguage] = useState("java");
  const [code, setCode] = useState("");
  
  // Execution State
  const [isRunning, setIsRunning] = useState(false);
  const [consoleOutput, setConsoleOutput] = useState(null); // The raw output log
  const [testResults, setTestResults] = useState([]); // Array of pass/fail results
  const [finalStatus, setFinalStatus] = useState(null); // "Accepted" | "Wrong Answer" | "Error"

  const [timeLeft, setTimeLeft] = useState(45 * 60); 

  useEffect(() => {
    // Load random problem and correct starter code
    const randomProb = PROBLEMS[Math.floor(Math.random() * PROBLEMS.length)];
    setProblem(randomProb);
    setCode(randomProb.starterCode["java"]);

    // Timer
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if(prev <= 1) { clearInterval(timer); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLanguageChange = (e) => {
    const lang = e.target.value;
    setLanguage(lang);
    setCode(problem.starterCode[lang] || "");
  };

  // --- 3. THE REAL EXECUTION LOGIC ---
  const executeCode = async (codeToRun, inputData) => {
    const config = LANGUAGE_VERSIONS[language];
    
    try {
      const response = await fetch("https://emkc.org/api/v2/piston/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          language: config.language,
          version: config.version,
          files: [{ name: config.file, content: codeToRun }],
          stdin: inputData, // Pass the test case input here!
        }),
      });
      return await response.json();
    } catch (err) {
      console.error(err);
      return null;
    }
  };

  const handleRun = async () => {
    setIsRunning(true);
    setConsoleOutput(null);
    setTestResults([]);
    setFinalStatus(null);

    const results = [];
    let allPassed = true;
    let runtimeError = null;

    // Loop through ALL test cases
    for (let i = 0; i < problem.testCases.length; i++) {
        const testCase = problem.testCases[i];
        
        // Call API
        const apiResult = await executeCode(code, testCase.input);

        // Check for System Errors (API failure)
        if (!apiResult || !apiResult.run) {
            runtimeError = "API Connection Failed";
            break;
        }

        // Check for Runtime/Compilation Errors (stderr)
        if (apiResult.run.stderr) {
            runtimeError = apiResult.run.stderr;
            break;
        }

        // Clean output (trim newlines)
        const actualOutput = apiResult.run.stdout ? apiResult.run.stdout.trim() : "";
        const passed = actualOutput === testCase.expected;

        if (!passed) allPassed = false;

        results.push({
            caseIndex: i + 1,
            input: testCase.input,
            expected: testCase.expected,
            actual: actualOutput,
            passed: passed
        });
    }

    setIsRunning(false);

    if (runtimeError) {
        setFinalStatus("Error");
        setConsoleOutput(runtimeError);
    } else {
        setTestResults(results);
        setFinalStatus(allPassed ? "Accepted" : "Wrong Answer");
    }
  };

  // ✅ 2. UPDATED SUBMIT LOGIC (Uses UPDATE instead of INSERT)
  const handleSubmit = async () => {
    if (finalStatus !== "Accepted") {
        if(!confirm("Your code has not passed all test cases. Submit anyway? Score will be 0.")) return;
    }
    
    const score = finalStatus === "Accepted" ? 100 : 0;
    
    try {
      // Update the EXISTING session
      const { error } = await supabase
        .from('mock_interview_sessions')
        .update({
          coding_score: score,
          status: 'completed', // Mark entire session as done
          coding_data: { 
            problemId: problem.id, 
            code: code, 
            language: language, 
            passed: score === 100 
          }
        })
        .eq('id', sessionId); // Target specific session

      if (error) throw error;
      
      onComplete(score);
    } catch(err) {
        console.error("Submission Error:", err);
        alert("Submission Failed");
    }
  };

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col bg-[#0A0A0A] border border-gray-800 rounded-2xl overflow-hidden animate-in fade-in">
      
      {/* TOOLBAR */}
      <div className="h-14 bg-[#111] border-b border-gray-800 flex items-center justify-between px-4">
        <div className="flex items-center gap-4">
            <h2 className="font-bold text-white flex items-center gap-2">
                <CodeIcon size={18} className="text-[#FF4A1F]" /> Coding Round
            </h2>
            <div className="h-4 w-px bg-gray-700" />
            <div className={`flex items-center gap-2 font-mono text-sm ${timeLeft < 300 ? 'text-red-500' : 'text-gray-400'}`}>
                <Clock size={16} />
                {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
            </div>
        </div>
        
        <div className="flex items-center gap-3">
            <select 
                value={language} 
                onChange={handleLanguageChange}
                className="bg-black text-gray-300 text-sm border border-gray-700 rounded-lg px-3 py-1.5 focus:border-[#FF4A1F] outline-none"
            >
                <option value="java">Java (JDK 15)</option>
                <option value="python">Python 3.10</option>
                <option value="cpp">C++ (GCC 10)</option>
            </select>
            <button 
                onClick={handleRun}
                disabled={isRunning}
                className="flex items-center gap-2 px-4 py-1.5 bg-gray-800 hover:bg-gray-700 text-white text-sm rounded-lg transition-colors border border-gray-700"
            >
               {isRunning ? <Cpu className="animate-spin" size={14} /> : <Play size={14} />} 
               {isRunning ? "Running..." : "Run Code"}
            </button>
            <button 
                onClick={handleSubmit}
                className="flex items-center gap-2 px-4 py-1.5 bg-[#FF4A1F] hover:bg-orange-600 text-black font-bold text-sm rounded-lg transition-colors"
            >
               Submit <Send size={14} />
            </button>
        </div>
      </div>

      {/* MAIN CONTENT SPLIT */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* LEFT: PROBLEM DESCRIPTION */}
        <div className="w-1/3 border-r border-gray-800 p-6 overflow-y-auto bg-[#0A0A0A]">
            <div className="flex items-center justify-between mb-4">
                <h1 className="text-xl font-bold">{problem.id}. {problem.title}</h1>
                <span className="text-xs px-2 py-1 rounded border border-green-800 text-green-500 bg-green-900/10">
                    {problem.difficulty}
                </span>
            </div>
            
            <p className="text-gray-400 text-sm leading-relaxed mb-6">{problem.description}</p>

            <h3 className="text-sm font-bold text-white mb-3 uppercase tracking-widest text-xs">Sample Case</h3>
            <div className="bg-[#111] p-4 rounded-lg border border-gray-800 font-mono text-sm mb-6">
                <div className="text-gray-500 text-xs mb-1">Input (StdIn):</div>
                <div className="text-white mb-3">{problem.testCases[0].input}</div>
                <div className="text-gray-500 text-xs mb-1">Expected Output:</div>
                <div className="text-[#FF4A1F]">{problem.testCases[0].expected}</div>
            </div>

            {/* STATUS BADGE */}
            {finalStatus && (
                <div className={`mt-4 p-4 rounded-xl border ${
                    finalStatus === "Accepted" ? "bg-green-900/20 border-green-500/50" : 
                    finalStatus === "Error" ? "bg-yellow-900/20 border-yellow-500/50" :
                    "bg-red-900/20 border-red-500/50"
                }`}>
                    <div className="flex items-center gap-2 mb-2">
                        {finalStatus === "Accepted" && <CheckCircle className="text-green-500" />}
                        {finalStatus === "Wrong Answer" && <XCircle className="text-red-500" />}
                        {finalStatus === "Error" && <AlertTriangle className="text-yellow-500" />}
                        <span className={`font-bold text-lg ${
                             finalStatus === "Accepted" ? "text-green-500" : 
                             finalStatus === "Error" ? "text-yellow-500" : "text-red-500"
                        }`}>
                            {finalStatus}
                        </span>
                    </div>
                    <p className="text-xs text-gray-400">
                        {finalStatus === "Accepted" ? "All test cases passed successfully." : 
                         finalStatus === "Error" ? "Runtime or Compilation error occurred." : 
                         "Your output did not match expected values."}
                    </p>
                </div>
            )}
        </div>

        {/* RIGHT: EDITOR & TERMINAL */}
        <div className="flex-1 flex flex-col bg-[#111]">
            <div className="flex-1 relative">
                <textarea
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    spellCheck="false"
                    className="w-full h-full bg-[#111] text-gray-300 font-mono text-sm p-4 outline-none resize-none leading-relaxed"
                    placeholder="// Type your solution here..."
                />
            </div>

            {/* EXECUTION CONSOLE */}
            <div className="h-64 border-t border-gray-800 bg-black flex flex-col">
                <div className="h-8 bg-[#0A0A0A] border-b border-gray-800 flex items-center px-4 gap-2 text-xs text-gray-500 uppercase tracking-wider">
                     <Terminal size={12} /> Test Results
                </div>
                
                <div className="flex-1 p-4 overflow-y-auto font-mono text-sm">
                    {/* LOADING STATE */}
                    {isRunning && (
                        <div className="flex items-center gap-2 text-yellow-500">
                            <Cpu className="animate-spin" /> Executing on remote server...
                        </div>
                    )}

                    {/* ERROR STATE */}
                    {!isRunning && finalStatus === "Error" && (
                        <div className="text-red-400 whitespace-pre-wrap">
                            <strong className="text-red-600 block mb-2">COMPILATION / RUNTIME ERROR:</strong>
                            {consoleOutput}
                        </div>
                    )}

                    {/* TEST CASE RESULTS */}
                    {!isRunning && testResults.length > 0 && (
                        <div className="space-y-3">
                            {testResults.map((res, i) => (
                                <div key={i} className={`p-3 rounded border ${res.passed ? "border-green-900/30 bg-green-900/10" : "border-red-900/30 bg-red-900/10"}`}>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className={`text-xs font-bold ${res.passed ? "text-green-500" : "text-red-500"}`}>
                                            Test Case #{res.caseIndex}
                                        </span>
                                        {res.passed ? <CheckCircle size={14} className="text-green-500"/> : <XCircle size={14} className="text-red-500"/>}
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 text-xs">
                                        <div>
                                            <span className="text-gray-500 block">Input:</span>
                                            <span className="text-gray-300">{res.input}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-500 block">Expected:</span>
                                            <span className="text-gray-300">{res.expected}</span>
                                        </div>
                                        {!res.passed && (
                                            <div className="col-span-2 pt-2 border-t border-red-900/30">
                                                <span className="text-red-400 block">Your Output:</span>
                                                <span className="text-red-300">{res.actual || "(No Output)"}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                    
                    {!isRunning && !finalStatus && <div className="text-gray-600 italic">Hit 'Run Code' to execute.</div>}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default CodingModule;