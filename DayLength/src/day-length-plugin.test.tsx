import React from 'react';
import ReactDOM from 'react-dom';
import DayLengthPlugin from './day-length-plugin';

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<DayLengthPlugin />, div);
  ReactDOM.unmountComponentAtNode(div);
});
