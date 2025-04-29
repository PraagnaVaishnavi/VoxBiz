import React, { useState, useRef, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import DocButton from "./ui/Document";
import Loader from "./ui/Loader";
import axios from "axios";

const CreateDatabaseModal = ({ darkMode, onClose }) => {
  const [step, setStep] = useState("initial");
  const [choice, setChoice] = useState(null); // postgres or excel
  const [file, setFile] = useState(null);
  const [formData, setFormData] = useState({
    dbName: "",
    connectionString: "",

  });
  const [schema, setSchema] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [voiceInput, setVoiceInput] = useState("");
  const [textInput, setTextInput] = useState("");
  const [inputType, setInputType] = useState("voice"); // voice or text
  const [error, setError] = useState("");

  // For voice recording
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
      setStep("form");
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'text/csv': ['.csv']
    }
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const submitForm = async (e) => {
    // If e exists, prevent default form submission behavior
    if (e && e.preventDefault) {
      e.preventDefault();
    }
    
    // Clear any existing errors
    setError("");
    
    // Continue with the form submission logic
    setStep("voice");
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);
      
      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };
      
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        // Send the audio to backend or process it
        submitVoiceOrText(audioBlob);
      };
      
      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error accessing microphone:", error);
      setError("Couldn't access your microphone. Please check permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const submitVoiceOrText = async (audioBlob) => {
    setStep("loading");
    
    try {
      let response;
      
      if (choice === "postgres") {
        const payload = {
          ...formData,
          instructions: inputType === "voice" ? "audio_data" : textInput
        };
        
        const formPayload = new FormData();
        Object.keys(payload).forEach(key => {
          if (key === "instructions" && inputType === "voice") {
            formPayload.append(key, audioBlob);
          } else {
            formPayload.append(key, payload[key]);
          }
        });
        
        response = await axios.post("http://localhost:8000/api/database/create", formPayload);
      } else {
        // Excel upload
        const formPayload = new FormData();
        formPayload.append("file", file);
        formPayload.append("dbName", formData.dbName);
        if (inputType === "voice") {
          formPayload.append("audioInstructions", audioBlob);
        } else {
          formPayload.append("textInstructions", textInput);
        }
        
        response = await axios.post("http://localhost:3000/api/database/excel", formPayload);
      }
      
      if (response.data && response.data.schema) {
        setSchema(response.data.schema);
        setStep("schema");
      }
    } catch (error) {
      console.error("Error submitting data:", error);
      setError("Failed to process your request. Please try again.");
      setStep(choice === "postgres" ? "postgres" : "excel");
    }
  };

  const confirmSchema = async () => {
    setStep("loading");
    
    try {
      await axios.post("http://localhost:3000/api/database/confirm");
      setStep("success");
    } catch (error) {
      console.error("Error confirming schema:", error);
      setError("Failed to confirm schema. Please try again.");
      setStep("schema");
    }
  };

  const editSchema = async () => {
    setStep("editSchema");
  };

  const submitSchemaEdit = async (e) => {
    e.preventDefault();
    setStep("loading");
    
    try {
      await axios.post("http://localhost:8000/api/database/edit", {
        instructions: inputType === "voice" ? "audio_data" : textInput
      });
      
      // Fetch updated schema
      const response = await axios.get("http://localhost:8000/api/database/schema");
      setSchema(response.data.schema);
      setStep("schema");
    } catch (error) {
      console.error("Error editing schema:", error);
      setError("Failed to update schema. Please try again.");
      setStep("editSchema");
    }
  };

  return (
    <div className={`fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50`}>
      <div className={`relative w-full max-w-2xl mx-2 md:mx-auto p-6 rounded-lg shadow-xl ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h2 className="text-xl font-bold mb-4">Create Database</h2>

        {error && (
          <div className={`p-3 mb-4 rounded-md ${darkMode ? 'bg-red-900 text-red-100' : 'bg-red-100 text-red-800'}`}>
            {error}
          </div>
        )}

        {step === "initial" && (
          <div>
            <p className="mb-4">Please select how you'd like to create your database:</p>
            <div className="flex space-x-4 justify-center">
              <button
                onClick={() => {
                  setChoice("postgres");
                  setStep("postgres");
                }}
                className={`px-4 py-2 rounded-lg ${darkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white`}
              >
                Connect PostgreSQL DB
              </button>
              <button
                onClick={() => {
                  setChoice("excel");
                  setStep("excel");
                }}
                className={`px-4 py-2 rounded-lg ${darkMode ? 'bg-green-600 hover:bg-green-700' : 'bg-green-500 hover:bg-green-600'} text-white`}
              >
                Upload Excel/CSV
              </button>
            </div>
          </div>
        )}

        {step === "postgres" && (
          <div>
            <div className={`mb-6 p-4 rounded-lg ${darkMode ? 'bg-blue-900 text-blue-100' : 'bg-blue-100 text-blue-800'}`}>
              <h3 className="font-bold mb-2">Important Information</h3>
              <p className="mb-2">Please ensure you have the following information ready:</p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Database name</li>
                <li>PostgreSQL connection string</li>
                <li>Database username and password</li>
                <li>The database should be empty as we'll be creating it afresh</li>
              </ul>
              <p className="mt-2 text-sm">
                To obtain these from PostgreSQL:
                <ol className="list-decimal list-inside mt-1 ml-2">
                  <li>Login to your PostgreSQL admin panel</li>
                  <li>Create a new empty database</li>
                  <li>Set up user credentials with appropriate permissions</li>
                  <li>Get the connection string from your PostgreSQL instance</li>
                </ol>
              </p>
            </div>
            <button
              onClick={() => {
                setError(""); // Clear any existing errors
                setStep("form");
              }}
              className={`w-full py-2 rounded-lg ${darkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white`}
            >
              {error ? "Retry" : "I'm Ready to Continue"}
            </button>
          </div>
        )}

        {step === "excel" && (
          <div>
            <div className={`mb-6 p-4 rounded-lg ${darkMode ? 'bg-blue-900 text-blue-100' : 'bg-blue-100 text-blue-800'}`}>
              <h3 className="font-bold mb-2">Upload Your Excel or CSV File</h3>
              <p className="mb-2">Please upload your data file and we'll create a database from it.</p>
              <p className="text-sm">After upload, you'll receive database credentials that you can access in the database details page.</p>
            </div>
            
            <div {...getRootProps()} className={`border-2 border-dashed rounded-lg p-6 mb-4 text-center cursor-pointer ${darkMode ? 'border-gray-600 hover:border-gray-500' : 'border-gray-300 hover:border-gray-400'}`}>
              <input {...getInputProps()} />
              {file ? (
                <p>Selected file: {file.name}</p>
              ) : isDragActive ? (
                <p>Drop the file here...</p>
              ) : (
                <div className="flex flex-col items-center justify-center">
                  <p className="mb-2">Drag and drop your Excel/CSV file here, or upload</p>
                  <DocButton text="Choose File" />
                </div>
              )}
            </div>
            
            {file && (
              <button
                onClick={() => {
                  setError(""); // Clear any existing errors
                  setStep("form");
                }}
                className={`w-full py-2 rounded-lg ${darkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white`}
              >
                {error ? "Retry" : "Continue"}
              </button>
            )}
          </div>
        )}

        {step === "form" && (
          <form onSubmit={(e) => {
            e.preventDefault();
            setError(""); // Clear any existing errors
            submitForm();
          }}>
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium mb-1">Database Name</label>
                <input
                  type="text"
                  name="dbName"
                  value={formData.dbName}
                  onChange={handleInputChange}
                  required
                  className={`w-full px-3 py-2 rounded-md ${darkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-900 border-gray-300'} border`}
                />
              </div>
              
              {choice === "postgres" && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-1">Connection String</label>
                    <input
                      type="text"
                      name="connectionString"
                      value={formData.connectionString}
                      onChange={handleInputChange}
                      required
                      placeholder="postgresql://username:password@host:port/database"
                      className={`w-full px-3 py-2 rounded-md ${darkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-900 border-gray-300'} border`}
                    />
                  </div>
                  {/* <div>
                    <label className="block text-sm font-medium mb-1">Username</label>
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      required
                      className={`w-full px-3 py-2 rounded-md ${darkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-900 border-gray-300'} border`}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Password</label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                      className={`w-full px-3 py-2 rounded-md ${darkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-900 border-gray-300'} border`}
                    />
                  </div> */}
                </>
              )}
            </div>
            
            <button
              type="submit"
              className={`w-full py-2 rounded-lg ${darkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white`}
            >
              {error ? "Retry" : "Continue"}
            </button>
          </form>
        )}

        {step === "voice" && (
          <div>
            <div className="mb-4">
              <h3 className="font-medium mb-2">Tell us about your database needs</h3>
              <p className="text-sm mb-4">
                Please provide details about:
                <ul className="list-disc list-inside mt-1 ml-2">
                  <li>What kind of data will be stored</li>
                  <li>How the data will be retrieved</li>
                  <li>Any specific requirements for your database schema</li>
                </ul>
              </p>
              
              <div className="flex justify-center space-x-4 mb-4">
                <button
                  onClick={() => {
                    setError(""); // Clear any existing errors
                    setInputType("voice");
                  }}
                  className={`px-4 py-2 rounded-lg ${
                    inputType === "voice"
                      ? darkMode
                        ? "bg-blue-600"
                        : "bg-blue-500"
                      : darkMode
                      ? "bg-gray-700"
                      : "bg-gray-200"
                  }`}
                >
                  Voice Input
                </button>
                <button
                  onClick={() => {
                    setError(""); // Clear any existing errors
                    setInputType("text");
                  }}
                  className={`px-4 py-2 rounded-lg ${
                    inputType === "text"
                      ? darkMode
                        ? "bg-blue-600"
                        : "bg-blue-500"
                      : darkMode
                      ? "bg-gray-700"
                      : "bg-gray-200"
                  }`}
                >
                  Text Input
                </button>
              </div>
              
              {inputType === "voice" ? (
                <div className="flex justify-center mb-4">
                  <button
                    onClick={() => {
                      setError(""); // Clear any existing errors
                      isRecording ? stopRecording() : startRecording();
                    }}
                    className={`w-20 h-20 rounded-full flex items-center justify-center ${isRecording 
                      ? (darkMode ? 'bg-red-600' : 'bg-red-500') 
                      : (darkMode ? 'bg-blue-600' : 'bg-blue-500')}`}
                  >
                    {isRecording ? (
                      <span className="text-white">Stop</span>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                      </svg>
                    )}
                  </button>
                </div>
              ) : (
                <div className="mb-4">
                  <textarea
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    className={`w-full px-3 py-2 rounded-md ${darkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-900 border-gray-300'} border`}
                    rows={5}
                    placeholder="Describe your database requirements..."
                  ></textarea>
                  <button
                    onClick={() => {
                      setError(""); // Clear any existing errors
                      submitVoiceOrText(null);
                    }}
                    className={`w-full mt-2 py-2 rounded-lg ${darkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white`}
                  >
                    {error ? "Retry" : "Submit"}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {step === "loading" && (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader size="large" />
            <p className="mt-4">Processing your request...</p>
          </div>
        )}

        {step === "schema" && schema && (
          <div>
            <h3 className="font-bold mb-4">Database Schema</h3>
            <div className={`max-h-96 overflow-y-auto mb-6 rounded-lg border ${darkMode ? 'border-gray-700' : 'border-gray-300'}`}>
              <table className={`min-w-full divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                <thead className={darkMode ? 'bg-gray-700' : 'bg-gray-50'}>
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider">Table</th>
                    <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider">Columns</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                  {Object.entries(schema).map(([tableName, columns]) => (
                    <tr key={tableName}>
                      <td className="px-3 py-2 text-sm whitespace-nowrap font-medium">{tableName}</td>
                      <td className="px-3 py-2 text-sm">
                        <ul className="list-disc list-inside">
                          {columns.map((column, idx) => (
                            <li key={idx}>{column.name} ({column.type}){column.constraints ? ` - ${column.constraints}` : ''}</li>
                          ))}
                        </ul>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="flex space-x-4 justify-end">
              <button
                onClick={() => {
                  setError(""); // Clear any existing errors
                  editSchema();
                }}
                className={`px-4 py-2 rounded-lg ${darkMode ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-yellow-500 hover:bg-yellow-600'} text-white`}
              >
                {error ? "Retry Edit" : "Edit Schema"}
              </button>
              <button
                onClick={() => {
                  setError(""); // Clear any existing errors
                  confirmSchema();
                }}
                className={`px-4 py-2 rounded-lg ${darkMode ? 'bg-green-600 hover:bg-green-700' : 'bg-green-500 hover:bg-green-600'} text-white`}
              >
                {error ? "Retry Confirmation" : "Confirm Schema"}
              </button>
            </div>
          </div>
        )}

        {step === "editSchema" && (
          <div>
            <h3 className="font-bold mb-4">Edit Schema</h3>
            <p className="mb-4">Please provide your feedback or changes needed to the schema:</p>
            
            <div className="flex space-x-4 mb-4">
              <button
                onClick={() => {
                  setError(""); // Clear any existing errors
                  setInputType("voice");
                }}
                className={`px-4 py-2 rounded-lg ${inputType === "voice" 
                  ? (darkMode ? 'bg-blue-600' : 'bg-blue-500') 
                  : (darkMode ? 'bg-gray-700' : 'bg-gray-200')}`}
              >
                Voice Input
              </button>
              <button
                onClick={() => {
                  setError(""); // Clear any existing errors
                  setInputType("text");
                }}
                className={`px-4 py-2 rounded-lg ${inputType === "text" 
                  ? (darkMode ? 'bg-blue-600' : 'bg-blue-500') 
                  : (darkMode ? 'bg-gray-700' : 'bg-gray-200')}`}
              >
                Text Input
              </button>
            </div>
            
            {inputType === "voice" ? (
              <div className="flex justify-center mb-4">
                <button
                  onClick={() => {
                    setError(""); // Clear any existing errors
                    isRecording ? stopRecording() : startRecording();
                  }}
                  className={`w-20 h-20 rounded-full flex items-center justify-center ${isRecording 
                    ? (darkMode ? 'bg-red-600' : 'bg-red-500') 
                    : (darkMode ? 'bg-blue-600' : 'bg-blue-500')}`}
                >
                  {isRecording ? (
                    <span className="text-white">Stop</span>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                  )}
                </button>
              </div>
            ) : (
              <form onSubmit={(e) => {
                e.preventDefault();
                setError(""); // Clear any existing errors
                submitSchemaEdit();
              }}>
                <textarea
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  className={`w-full px-3 py-2 rounded-md ${darkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-900 border-gray-300'} border`}
                  rows={5}
                  placeholder="Describe the changes needed..."
                ></textarea>
                <button
                  type="submit"
                  className={`w-full mt-4 py-2 rounded-lg ${darkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white`}
                >
                  {error ? "Retry Submission" : "Submit Changes"}
                </button>
              </form>
            )}
          </div>
        )}

        {step === "success" && (
          <div className="text-center py-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-green-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <h3 className="text-xl font-bold mb-2">Database Created Successfully!</h3>
            <p className="mb-4">Your new database has been set up and is ready to use.</p>
            <button
              onClick={onClose}
              className={`px-4 py-2 rounded-lg ${darkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white`}
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateDatabaseModal;