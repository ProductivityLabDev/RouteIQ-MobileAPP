import React from 'react';
import {Defs, Path, Svg} from 'react-native-svg';
import {screenWidth} from '../../utils/constants';

const ReactangleIcon = () => {
  return (
    <Svg
      viewBox="340.2 118.994 218.985 59.102"
      width={screenWidth + 2}
      height={111}>
      <Defs />
      <Path
        style="fill: rgb(216, 216, 216); stroke: rgb(0, 0, 0); transform-box: fill-box; transform-origin: 50% 50%;"
        d="M 340 120.922 L 340.593 180.34 C 347.392 124.182 544.533 122.738 560 179.175 L 559.407 120.34 L 340 120.922 Z"
      />
    </Svg>
  );
};

export default ReactangleIcon;
