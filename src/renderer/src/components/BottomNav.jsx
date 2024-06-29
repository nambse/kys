/* eslint-disable react/prop-types */
import { useState, Fragment } from 'react';
import { Link } from 'react-router-dom';

function BottomNav({checkIfDbSelected = true, isItRafflePage = false }) {
  const [isMenuVisible, setIsMenuVisible] = useState(true);

  const toggleMenu = () => {
    setIsMenuVisible(!isMenuVisible);
  };

  return (
    <div className="fixed bottom-0 w-full bg-transparent shadow-md z-10">
      <div className={`flex justify-start items-center py-2 ${isMenuVisible ? 'flex' : 'hidden'}`}>
        <Link to="/" className="no-underline bg-gray-700 hover:bg-gray-800 text-white font-semibold py-2 px-4 rounded-lg transition duration-300 mx-2">
          Ayarlar ⚙️
        </Link>
        {checkIfDbSelected && (
        <Fragment>
        <Link to="/katilimci" className="no-underline bg-gray-700 hover:bg-gray-800 text-white font-semibold py-2 px-4 rounded-lg transition duration-300 mx-2">
            Katılımcılar 👩🏻‍👨🏻‍👦🏻‍👧🏻
          </Link>
        <Link to="/konut" className="no-underline bg-gray-700 hover:bg-gray-800 text-white font-semibold py-2 px-4 rounded-lg transition duration-300 mx-2">
            Konutlar 🏘️
        </Link>
        <Link to="/raffle" className="no-underline bg-gray-700 hover:bg-gray-800 text-white font-semibold py-2 px-4 rounded-lg transition duration-300 mx-2">
            Kura 🎰
        </Link>
        </Fragment>
        )}
      </div>
      {isItRafflePage ? (
        <button onClick={toggleMenu} 
      className={isMenuVisible ? "border-none absolute right-5 bottom-2 bg-gray-700 text-white p-2 rounded-full hover:bg-gray-800 focus:outline-none focus:outline-0 active:outline-0" :
      "border-none absolute right-5 bottom-2 bg-gray-700 text-white p-2 rounded-full hover:bg-gray-800 focus:outline-none opacity-0 hover:opacity-100"
      }>
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={isMenuVisible ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}></path>
        </svg>
      </button>)
      :
      (<button onClick={toggleMenu} 
      className="h-10 w-10 border-none absolute right-5 bottom-2 bg-gray-700 text-white p-2 rounded-full hover:bg-gray-800 focus:outline-none focus:outline-0 active:outline-0">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={isMenuVisible ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}></path>
        </svg>
      </button>)
      }
    </div>
  );
}

export default BottomNav;
