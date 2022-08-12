import {Navbar, Welcome, Footer, Transactions} from './components'

//This is the home page which has multiple components

const App = () => {
  return (
    <div className='min-h-screen'>
      <div className='gradient-bg-welcome'>
        <Navbar/>
        <Welcome/>
      </div>
      <Transactions/>
      <Footer/>

    </div>
  );
}

export default App
