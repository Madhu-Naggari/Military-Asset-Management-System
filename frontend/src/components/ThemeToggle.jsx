import { FaMoon, FaSun } from 'react-icons/fa6';

import { useTheme } from '../context/ThemeContext.jsx';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button type="button" className="theme-toggle" onClick={toggleTheme}>
      {theme === 'light' ? <FaMoon /> : <FaSun />}
      <span>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
    </button>
  );
};

export default ThemeToggle;
