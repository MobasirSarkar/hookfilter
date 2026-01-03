"use client"
import PipesPage from "./(dashboard)/pipes/page";

export default function Page() {
    localStorage.setItem("access_token",
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiNjQyNGRhMjItMjc0Mi00MWMzLWJkMzMtZDFkZWQ3MWI2YzE4IiwidG9rZW5fdiI6MSwiaXNzIjoiYXV0aC1zZXJ2aWNlIiwic3ViIjoiNjQyNGRhMjItMjc0Mi00MWMzLWJkMzMtZDFkZWQ3MWI2YzE4IiwiYXVkIjpbImxvY2FsIl0sImV4cCI6MTc2NzUyNDM2MywibmJmIjoxNzY3NDM3OTYzLCJpYXQiOjE3Njc0Mzc5NjMsImp0aSI6Ijg5NjBiNzdhLWQ3ODAtNGU4OC04MGQ2LTRhNDYyYjFlYmQ1YyJ9.xtVwfHduUxuUMttJOak06P5y37K3LhETgeWD0vUFjYg"
    )
    return (
        <PipesPage />
    )
}
