// src/LoginPage.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function LoginPage({ setToken, setRole}) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            const response = await login(email, password);
            localStorage.setItem('token', response.token);
            localStorage.setItem('role', response.role);
            console.log('Login successful', response);
            setToken(response.token);
            setRole(response.role);

            navigate('/');  
        } catch (err) {
            setError('Prisijungimas nepavyko, patikrinkite prisijungimo duomenis.');
            console.error('Login error', err);
        }
    };

    const login = async (email, password) => {
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
            throw new Error('Nepavyko pasiekti serverio');
        }
        const data = await response.json();
        return data;
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
                <h1 className="text-3xl font-semibold text-center text-gray-700 mb-4">Prisijungti</h1>

                {error && <p className="text-red-500 text-center mb-4">{error}</p>}

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="email" className="block text-sm font-medium text-gray-600">El. paštas:</label>
                        <input 
                            id="email" 
                            type="email" 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                            required 
                            className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                        />
                    </div>

                    <div className="mb-4">
                        <label htmlFor="password" className="block text-sm font-medium text-gray-600">Slaptažodis:</label>
                        <input 
                            id="password" 
                            type="password" 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            required 
                            className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>

                    <div className="mt-6">
                        <button type="submit" className="w-full p-2 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                            Prisijungti
                        </button>
                    </div>
                </form>

                <div className="mt-4 text-center">
                    <p className="text-sm text-gray-600">
                        Neturite paskyros? 
                        <a href="/register" className="text-indigo-600 hover:text-indigo-700"> Prisiregistruokite</a>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default LoginPage;
