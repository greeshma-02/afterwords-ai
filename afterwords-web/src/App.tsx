import { useState } from "react";

interface Book {
  id: number;
  title: string;
  author: string;
  sadness?: number;
  comfort?: number;
  hope?: number;
  joy?: number;
  humor?: number;
  connection?: number;
  intensity?: number;
}

function App() {
  const [emotion, setEmotion] = useState("");
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);

  const searchBooks = async () => {
    if (!emotion) return;

    setLoading(true);

    try {
      const response = await fetch(
        `http://localhost:5259/api/books/search?emotion=${emotion}`
      );

      const data = await response.json();
      setBooks(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching books:", error);
    }

    setLoading(false);
  };

  return (
    <div style={{
      width: "100%",
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "flex-start",
      paddingTop: "40px",
      fontFamily: "Georgia, serif",
      backgroundColor: "#f7f3ea"
    }}>
      
      <h1 style={{
        fontSize: "42px",
        marginBottom: "10px",
        color: "#3a3a3a"
      }}>
        Afterwords
      </h1>

      <p style={{
        marginBottom: "20px",
        color: "#666"
      }}>
        How do you want to feel today?
      </p>

      <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap", justifyContent: "center" }}>
        <input
          id="emotion-search"
          value={emotion}
          onChange={(e) => setEmotion(e.target.value)}
          placeholder="comfort, joy, friendship, calm..."
          style={{
            padding: "12px",
            width: "300px",
            borderRadius: "8px",
            border: "1px solid #ccc",
            fontSize: "16px"
          }}
        />

        <button
          onClick={searchBooks}
          style={{
            padding: "12px 20px",
            borderRadius: "8px",
            border: "none",
            backgroundColor: "#6b705c",
            color: "white",
            fontSize: "16px",
            cursor: "pointer"
          }}
        >
          Search
        </button>
      </div>

      {loading && (
        <p style={{ marginTop: "20px" }}>
          Searching...
        </p>
      )}

      <div style={{
        marginTop: "40px",
        width: "400px"
      }}>
        {books.map((book) => (
          <div
            key={book.id}
            style={{
              marginBottom: "20px",
              padding: "15px",
              backgroundColor: "white",
              borderRadius: "10px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.05)"
            }}
          >
            <h3 style={{ margin: "0", fontSize: "1.15rem", color: "#2c2c2c" }}>
              {book.title}
            </h3>

            <p style={{
              margin: "5px 0 0 0",
              color: "#666"
            }}>
              {book.author}
            </p>

          </div>
        ))}
      </div>

    </div>
  );
}

export default App;
