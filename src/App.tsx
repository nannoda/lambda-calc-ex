import { createSignal, type Component } from 'solid-js';
import { LambdaTree } from './lambda-tree';

// import logo from './logo.svg';
// import styles from './App.module.css';

const App: Component = () => {
  const [lambda, setLambda] = createSignal("");

  return (
    <div
      style={
        {
          display: 'flex',
          "flex-direction":"column"
        }
      }
    >
      <p>View Source Code on <a href="https://github.com/nannoda/lambda-calc-ex">GitHub</a></p>
      <input
        oninput={(v) => { 
          // console.log(v);
          
          setLambda(v.target.value) 
        }}
      ></input>
      <LambdaTree
        lambda={lambda}
      ></LambdaTree>
    </div>
  );
};

export default App;
