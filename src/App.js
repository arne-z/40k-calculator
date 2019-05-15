import React from 'react';
import './App.scss';
import './components/CalcForm'
import CalcForm from './components/CalcForm';
import Header from './components/Header'

function App() {
  return (
    <div className="App">
      <Header/>
      <CalcForm/>
    </div>
  );
}

export default App;
