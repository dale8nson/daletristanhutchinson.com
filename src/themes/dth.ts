import { createDarkTheme, createLightTheme } from '@fluentui/react-components';
import type { BrandVariants, Theme } from '@fluentui/react-components';
import { deepStrictEqual } from 'assert';



const dTh: BrandVariants = { 
    10: "#030303",
    20: "#171717",
    30: "#252525",
    40: "#313131",
    50: "#3D3D3D",
    60: "#494949",
    70: "#565656",
    80: "#636363",
    90: "#717171",
    100: "#7F7F7F",
    110: "#8D8D8D",
    120: "#9B9B9B",
    130: "#AAAAAA",
    140: "#B9B9B9",
    150: "#C8C8C8",
    160: "#D7D7D7"
  };
  
   const lightTheme: Theme = {
     ...createLightTheme(dTh), 
  };
  
   const darkTheme: Theme = {
     ...createDarkTheme(dTh), 
    colorBrandForeground1: dTh[120]
  };
   
  
   darkTheme.colorBrandForeground1 = dTh[110];
   darkTheme.colorBrandForeground2 = dTh[120];

   const dThTheme = {darkTheme, lightTheme};

export default dThTheme;
