import { useState } from 'react'
import './App.css'
import Dashboard from './Dashboard'
function App() {
    const [count, setCount] = useState<number>(0)

    return (
        <>
            <Dashboard />
        </>
    )
}

export default App