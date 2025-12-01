import dpsLogo from './assets/DPS.svg';
import './App.css';
import AddressForm from './pages/AddressForm';
import Test from './pages/Test';


function App() {
	return (
		<>
			<div>
				<a href="https://www.digitalproductschool.io/" target="_blank">
					<img src={dpsLogo} className="logo" alt="DPS logo" />
				</a>
			</div>
			<div className="home-card">
				<Test />
			</div>
		</>
	);
}

export default App;
