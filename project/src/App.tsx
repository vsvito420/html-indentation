import React, { useState, useEffect } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { html } from '@codemirror/lang-html';
import { indentUnit } from '@codemirror/language';
import { EditorState } from '@codemirror/state';
import { Trophy, ArrowRight, RefreshCw, Moon, Sun, ArrowLeft, ArrowDown, ArrowUp, Keyboard, Timer } from 'lucide-react';
import { exercises } from './exercises';

function calculateIndentationScore(userCode: string, solution: string): number {
  const userLines = userCode.split('\n');
  const solutionLines = solution.split('\n');
  
  if (userLines.length !== solutionLines.length) return 0;
  
  let correctLines = 0;
  for (let i = 0; i < userLines.length; i++) {
    const userIndent = userLines[i].search(/\S/);
    const solutionIndent = solutionLines[i].search(/\S/);
    if (userIndent === solutionIndent) correctLines++;
  }
  
  return Math.round((correctLines / solutionLines.length) * 100);
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function App() {
  const [currentExercise, setCurrentExercise] = useState(0);
  const [code, setCode] = useState(exercises[0].initialCode);
  const [score, setScore] = useState<number | null>(null);
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });
  const [time, setTime] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [scores, setScores] = useState<number[]>([]);

  useEffect(() => {
    const timer = setInterval(() => {
      if (!isComplete) {
        setTime(t => t + 1);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [isComplete]);

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const handleCheck = () => {
    const score = calculateIndentationScore(code, exercises[currentExercise].solution);
    setScore(score);
    
    if (score >= 90) {
      const newScores = [...scores];
      newScores[currentExercise] = score;
      setScores(newScores);
      
      if (currentExercise === exercises.length - 1) {
        setIsComplete(true);
      }
    }
  };

  const handleNext = () => {
    if (currentExercise < exercises.length - 1) {
      setCurrentExercise(prev => prev + 1);
      setCode(exercises[currentExercise + 1].initialCode);
      setScore(null);
    }
  };

  const handleReset = () => {
    setCode(exercises[currentExercise].initialCode);
    setScore(null);
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const averageScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;

  // CodeMirror configuration
  const editorExtensions = [
    html(),
    indentUnit.of("  "),
    EditorState.tabSize.of(2),
    EditorState.changeFilter.of((tr) => {
      // Handle backspace to remove indentation one level at a time
      if (tr.isUserEvent("delete.backward")) {
        const pos = tr.state.selection.main.head;
        const line = tr.state.doc.lineAt(pos);
        const beforeCursor = line.text.slice(0, pos - line.from);
        if (/^\s+$/.test(beforeCursor)) {
          const spaces = beforeCursor.length;
          const newSpaces = Math.max(0, spaces - 2); // Remove 2 spaces at a time
          const change = {
            from: line.from,
            to: pos,
            insert: " ".repeat(newSpaces)
          };
          return [tr.state.update({ changes: change })];
        }
      }
      return true;
    })
  ];

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-100 text-gray-800'} p-4 md:p-8 transition-colors duration-200`}>
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-4 lg:gap-8">
        {/* Main Content */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold mb-2">HTML Einrücken lernen</h1>
              <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Übe das richtige Einrücken von HTML-Code. Versuche den Code schön und lesbar zu formatieren!
              </p>
            </div>
            <div className="flex items-center gap-4 shrink-0">
              <div className="flex items-center gap-2">
                <Timer size={20} />
                <span className="font-mono">{formatTime(time)}</span>
              </div>
              <button
                onClick={toggleDarkMode}
                className={`p-2 rounded-lg ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} transition-colors`}
              >
                {darkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>
            </div>
          </div>

          {isComplete ? (
            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6 mb-8`}>
              <h2 className="text-2xl font-bold mb-4">Gratulation! 🎉</h2>
              <div className="space-y-4">
                <p>Du hast alle Übungen abgeschlossen!</p>
                <p>Zeit: {formatTime(time)}</p>
                <p>Durchschnittliche Punktzahl: {averageScore}%</p>
              </div>
            </div>
          ) : (
            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6 mb-8`}>
              <h2 className="text-xl font-semibold mb-2">
                Übung {currentExercise + 1}: {exercises[currentExercise].title}
              </h2>
              <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-4`}>
                {exercises[currentExercise].description}
              </p>

              <div className="mb-4">
                <CodeMirror
                  value={code}
                  height="300px"
                  extensions={editorExtensions}
                  onChange={(value) => {
                    setCode(value);
                    setScore(null);
                  }}
                  className="border rounded-lg [&_.cm-content]:text-lg [&_.cm-gutters]:text-lg"
                  theme={darkMode ? 'dark' : 'light'}
                />
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <button
                  onClick={handleCheck}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Überprüfen
                </button>
                <button
                  onClick={handleReset}
                  className={`flex items-center gap-2 ${darkMode ? 'text-gray-300 hover:text-gray-100' : 'text-gray-600 hover:text-gray-800'}`}
                >
                  <RefreshCw size={16} /> Zurücksetzen
                </button>
                {currentExercise < exercises.length - 1 && score >= 90 && (
                  <button
                    onClick={handleNext}
                    className="flex items-center gap-2 text-blue-500 hover:text-blue-600 ml-auto"
                  >
                    Nächste Übung <ArrowRight size={16} />
                  </button>
                )}
              </div>

              {score !== null && (
                <div className={`mt-4 p-4 rounded-lg ${score >= 90 ? 'bg-green-100 dark:bg-green-900' : 'bg-yellow-100 dark:bg-yellow-900'}`}>
                  <div className="flex items-center gap-2">
                    <Trophy size={20} className={score >= 90 ? 'text-green-500' : 'text-yellow-500'} />
                    <span className="font-semibold">
                      {score}% richtig eingerückt
                      {score >= 90 && ' - Super gemacht! 🎉'}
                      {score < 90 && ' - Versuch es noch einmal!'}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className={`${darkMode ? 'bg-gray-800' : 'bg-blue-50'} rounded-lg p-6`}>
            <h3 className="text-lg font-semibold mb-2">Tipps zum Einrücken:</h3>
            <ul className="list-disc list-inside space-y-2">
              <li>Jedes verschachtelte Element sollte weiter eingerückt sein als sein Elternelement</li>
              <li>Verwende die Tab-Taste oder Leerzeichen zum Einrücken</li>
              <li>Schließende Tags sollten auf der gleichen Ebene wie öffnende Tags sein</li>
              <li>Eine gute Einrückung macht den Code lesbarer und hilft Fehler zu finden</li>
            </ul>
          </div>
        </div>

        {/* Keyboard Shortcuts Sidebar */}
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6 lg:w-80 shrink-0`}>
          <div className="flex items-center gap-2 mb-4">
            <Keyboard size={20} />
            <h3 className="text-lg font-semibold">Tastatur-Shortcuts</h3>
          </div>
          
          <div className="space-y-6">
            <div>
              <h4 className="font-medium mb-2">Navigation</h4>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <kbd className={`px-2 py-1 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    <ArrowLeft size={16} />
                  </kbd>
                  <kbd className={`px-2 py-1 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    <ArrowRight size={16} />
                  </kbd>
                  <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Cursor bewegen</span>
                </div>
                <div className="flex items-center gap-2">
                  <kbd className={`px-2 py-1 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>Ctrl</kbd>
                  <span>+</span>
                  <kbd className={`px-2 py-1 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>←/→</kbd>
                  <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Wortweise springen</span>
                </div>
                <div className="flex items-center gap-2">
                  <kbd className={`px-2 py-1 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    <ArrowUp size={16} />
                  </kbd>
                  <kbd className={`px-2 py-1 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    <ArrowDown size={16} />
                  </kbd>
                  <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Zeilen wechseln</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2">Einrücken</h4>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <kbd className={`px-2 py-1 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>Tab</kbd>
                  <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Einrücken</span>
                </div>
                <div className="flex items-center gap-2">
                  <kbd className={`px-2 py-1 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>Shift</kbd>
                  <span>+</span>
                  <kbd className={`px-2 py-1 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>Tab</kbd>
                  <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Ausrücken</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2">Auswahl</h4>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <kbd className={`px-2 py-1 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>Shift</kbd>
                  <span>+</span>
                  <kbd className={`px-2 py-1 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>↑/↓</kbd>
                  <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Zeilen auswählen</span>
                </div>
                <div className="flex items-center gap-2">
                  <kbd className={`px-2 py-1 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>Ctrl</kbd>
                  <span>+</span>
                  <kbd className={`px-2 py-1 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>A</kbd>
                  <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Alles auswählen</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;