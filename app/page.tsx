'use client';

import { useState } from 'react';
import axios from 'axios';
import { YOUTUBE_CONSTANTS } from '@/constants/youtube.constant';

export default function Home() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleDownload = async () => {
    if (!url) {
      setError(YOUTUBE_CONSTANTS.MESSAGES.MISSING_URL);
      return;
    }

    if (!YOUTUBE_CONSTANTS.REGEX.test(url)) {
      setError(YOUTUBE_CONSTANTS.MESSAGES.INVALID_URL);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await axios.post(
        '/api/download',
        { url },
        {
          responseType: 'blob',
          timeout: YOUTUBE_CONSTANTS.TIMEOUT,
        }
      );

      const blob = new Blob([response.data], { type: 'audio/mpeg' });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = 'audio.mp3';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.data) {
        const reader = new FileReader();
        reader.onload = () => {
          try {
            const errorData = JSON.parse(reader.result as string);
            setError(errorData.error || YOUTUBE_CONSTANTS.MESSAGES.DOWNLOAD_ERROR);
          } catch {
            setError(YOUTUBE_CONSTANTS.MESSAGES.DOWNLOAD_ERROR);
          }
        };
        reader.readAsText(err.response.data);
      } else {
        setError(YOUTUBE_CONSTANTS.MESSAGES.DOWNLOAD_ERROR);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 to-blue-600 p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          YouTube a MP3
        </h1>

        <div className="space-y-4">
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://youtube.com/watch?v=..."
            disabled={loading}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
          />

          <button
            onClick={handleDownload}
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                {YOUTUBE_CONSTANTS.MESSAGES.PROCESSING}
              </>
            ) : (
              YOUTUBE_CONSTANTS.MESSAGES.READY
            )}
          </button>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
