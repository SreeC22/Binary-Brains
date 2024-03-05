import React from 'react';
import './CodeConvertPage.css';
import { ChakraProvider } from '@chakra-ui/react';
import CodeEditorWindow from '../Components/CodeEditorWindow';

const CodeConvertPage = () => {

    return (
        <>
            <div className='CodeTranslation'>
                <div className="Layout233">
                    <div class="Content233" >
                        <div class="Column233">
                            <div class="SectionTitle233" >
                                <div class="Icon233" >
                                    <div class="Vector" >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="49" height="48" viewBox="0 0 49 48" fill="none">
                                            <path fill-rule="evenodd" clip-rule="evenodd" d="M41.7935 14.24L41.5135 13.74C41.1523 13.1354 40.6429 12.6329 40.0335 12.28L26.6135 4.54C26.0059 4.1875 25.3161 4.00124 24.6135 4H24.0335C23.3309 4.00124 22.6411 4.1875 22.0335 4.54L8.61349 12.3C8.00744 12.6505 7.50402 13.1539 7.1535 13.76L6.8735 14.26C6.521 14.8677 6.33474 15.5575 6.3335 16.26V31.76C6.33474 32.4626 6.521 33.1524 6.8735 33.76L7.1535 34.26C7.51308 34.859 8.01448 35.3604 8.61349 35.72L22.0535 43.46C22.6581 43.8198 23.3499 44.0066 24.0535 44H24.6135C25.3161 43.9988 26.0059 43.8126 26.6135 43.46L40.0335 35.7C40.6455 35.3574 41.1509 34.852 41.4935 34.24L41.7935 33.74C42.1417 33.1306 42.3277 32.442 42.3335 31.74V16.24C42.3323 15.5375 42.1461 14.8477 41.7935 14.24ZM24.0335 8H24.6135L36.3335 14.76L24.3335 21.68L12.3335 14.76L24.0335 8ZM26.3335 39L38.0335 32.24L38.3335 31.74V18.22L26.3335 25.16V39Z" fill="black" />
                                        </svg>
                                    </div>
                                </div>
                                <div class="Content2333">
                                    <div class="Heading233">Step-by-Step Code Translation Process</div>
                                    <div class="Text233" >Our code translation tool simplifies the process for you.</div>
                                </div>
                            </div>
                        </div>
                        <div class="Column233" >
                            <div class="SectionTitle233">
                                <div class="Icon233">
                                    <div class="Vector">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="49" height="48" viewBox="0 0 49 48" fill="none">
                                            <path fill-rule="evenodd" clip-rule="evenodd" d="M41.7935 14.24L41.5135 13.74C41.1523 13.1354 40.6429 12.6329 40.0335 12.28L26.6135 4.54C26.0059 4.1875 25.3161 4.00124 24.6135 4H24.0335C23.3309 4.00124 22.6411 4.1875 22.0335 4.54L8.61349 12.3C8.00744 12.6505 7.50402 13.1539 7.1535 13.76L6.8735 14.26C6.521 14.8677 6.33474 15.5575 6.3335 16.26V31.76C6.33474 32.4626 6.521 33.1524 6.8735 33.76L7.1535 34.26C7.51308 34.859 8.01448 35.3604 8.61349 35.72L22.0535 43.46C22.6581 43.8198 23.3499 44.0066 24.0535 44H24.6135C25.3161 43.9988 26.0059 43.8126 26.6135 43.46L40.0335 35.7C40.6455 35.3574 41.1509 34.852 41.4935 34.24L41.7935 33.74C42.1417 33.1306 42.3277 32.442 42.3335 31.74V16.24C42.3323 15.5375 42.1461 14.8477 41.7935 14.24ZM24.0335 8H24.6135L36.3335 14.76L24.3335 21.68L12.3335 14.76L24.0335 8ZM26.3335 39L38.0335 32.24L38.3335 31.74V18.22L26.3335 25.16V39Z" fill="black" />
                                        </svg>
                                    </div>
                                </div>
                                <div class="Content2333" >
                                    <div class="Heading233" >Submit Your Code</div>
                                    <div class="Text233" >Easily submit your code and select the desired language.</div>
                                </div>
                            </div>
                        </div>
                        <div class="Column233" >
                            <div class="SectionTitle233">
                                <div class="Icon233" >
                                    <div class="Vector" >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="49" height="48" viewBox="0 0 49 48" fill="none">
                                            <path fill-rule="evenodd" clip-rule="evenodd" d="M41.7935 14.24L41.5135 13.74C41.1523 13.1354 40.6429 12.6329 40.0335 12.28L26.6135 4.54C26.0059 4.1875 25.3161 4.00124 24.6135 4H24.0335C23.3309 4.00124 22.6411 4.1875 22.0335 4.54L8.61349 12.3C8.00744 12.6505 7.50402 13.1539 7.1535 13.76L6.8735 14.26C6.521 14.8677 6.33474 15.5575 6.3335 16.26V31.76C6.33474 32.4626 6.521 33.1524 6.8735 33.76L7.1535 34.26C7.51308 34.859 8.01448 35.3604 8.61349 35.72L22.0535 43.46C22.6581 43.8198 23.3499 44.0066 24.0535 44H24.6135C25.3161 43.9988 26.0059 43.8126 26.6135 43.46L40.0335 35.7C40.6455 35.3574 41.1509 34.852 41.4935 34.24L41.7935 33.74C42.1417 33.1306 42.3277 32.442 42.3335 31.74V16.24C42.3323 15.5375 42.1461 14.8477 41.7935 14.24ZM24.0335 8H24.6135L36.3335 14.76L24.3335 21.68L12.3335 14.76L24.0335 8ZM26.3335 39L38.0335 32.24L38.3335 31.74V18.22L26.3335 25.16V39Z" fill="black" />
                                        </svg>
                                    </div>
                                </div>
                                <div class="Content2333" >
                                    <div class="Heading233" >Translation Output</div>
                                    <div class="Text233"  >View the translated code with enhanced readability features.</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="CodeInterface">
                    <div className="textbox">Drop your code here!</div>
                    {/* <div className="Rectangle6"><svg xmlns="http://www.w3.org/2000/svg" width="1640" height="88" viewBox="0 0 1640 88" fill="none">
                <path d="M0 40.0001C0 17.9087 17.9086 8.39233e-05 40 8.39233e-05H1600C1622.09 8.39233e-05 1640 17.9087 1640 40.0001V48C1640 70.0914 1622.09 88 1600 88H40C17.9086 88 0 70.0914 0 48V40.0001Z" fill="#DFD3D3" fill-opacity="0.23"/>
                </svg>  
            </div> */}


                    <div className="Python">
                        <svg xmlns="http://www.w3.org/2000/svg" width="92" height="85" viewBox="0 0 92 85" fill="none">
                            <g clip-path="url(#clip0_45_13174)">
                                <path d="M16.12 0.817878H74.9106C77.028 0.816005 79.1251 1.20598 81.0818 1.96549C83.0384 2.725 84.8163 3.83913 86.3136 5.24412C87.8108 6.64911 88.9982 8.31737 89.8076 10.1534C90.617 11.9895 91.0326 13.9573 91.0306 15.9443V68.9756C91.0326 70.9626 90.617 72.9304 89.8076 74.7664C88.9982 76.6025 87.8108 78.2708 86.3136 79.6758C84.8163 81.0807 83.0384 82.1949 81.0818 82.9544C79.1251 83.7139 77.028 84.1039 74.9106 84.102H16.12C14.0025 84.1039 11.9055 83.7139 9.94878 82.9544C7.99212 82.1949 6.21427 81.0807 4.71699 79.6758C3.21972 78.2708 2.0324 76.6025 1.223 74.7664C0.413605 72.9304 -0.00198858 70.9626 7.15377e-06 68.9756V15.9443C-0.00198858 13.9573 0.413605 11.9895 1.223 10.1534C2.0324 8.31737 3.21972 6.64911 4.71699 5.24412C6.21427 3.83913 7.99212 2.725 9.94878 1.96549C11.9055 1.20598 14.0025 0.816005 16.12 0.817878Z" fill="#000B1D" />
                                <path d="M45.3871 14.5597C29.6084 14.5597 30.5938 20.82 30.5938 20.82L30.6113 27.3056H45.6685V29.2529H24.6307C24.6307 29.2529 14.5339 28.2052 14.5339 42.7712C14.5339 57.3372 23.3466 56.8207 23.3466 56.8207H28.6061V50.0615C28.6061 50.0615 28.3226 41.9988 37.278 41.9988C46.2335 41.9988 52.2121 41.9988 52.2121 41.9988C52.2121 41.9988 60.6026 42.1228 60.6026 34.5797C60.6026 27.0366 60.6026 22.1074 60.6026 22.1074C60.6026 22.1074 61.8765 14.5597 45.3871 14.5597ZM37.0845 18.921C38.5826 18.921 39.7934 20.0287 39.7934 21.3993C39.7934 22.7699 38.5826 23.8777 37.0845 23.8777C35.5864 23.8777 34.3756 22.7699 34.3756 21.3993C34.3756 20.0287 35.5864 18.921 37.0845 18.921Z" fill="url(#paint0_linear_45_13174)" />
                                <path d="M45.8352 71.1288C61.6139 71.1288 60.6286 64.8686 60.6286 64.8686L60.611 58.383H45.5538V56.4357H66.5916C66.5916 56.4357 76.6884 57.4833 76.6884 42.9173C76.6884 28.3513 67.8757 28.8679 67.8757 28.8679H62.6162V35.627C62.6162 35.627 62.8997 43.6898 53.9443 43.6898C44.9888 43.6898 39.0102 43.6898 39.0102 43.6898C39.0102 43.6898 30.6197 43.5657 30.6197 51.1088C30.6197 58.6519 30.6197 63.5811 30.6197 63.5811C30.6197 63.5811 29.3458 71.1288 45.8352 71.1288ZM54.1378 66.7676C52.6397 66.7676 51.4289 65.6598 51.4289 64.2892C51.4289 62.9186 52.6397 61.8108 54.1378 61.8108C55.6359 61.8108 56.8467 62.9186 56.8467 64.2892C56.8467 65.6598 55.6359 66.7676 54.1378 66.7676Z" fill="url(#paint1_linear_45_13174)" />
                            </g>
                            <defs>
                                <linearGradient id="paint0_linear_45_13174" x1="20.5071" y1="19.5043" x2="48.5062" y2="50.21" gradientUnits="userSpaceOnUse">
                                    <stop stop-color="#387EB8" />
                                    <stop offset="1" stop-color="#366994" />
                                </linearGradient>
                                <linearGradient id="paint1_linear_45_13174" x1="39.4131" y1="37.4517" x2="69.6078" y2="69.0705" gradientUnits="userSpaceOnUse">
                                    <stop stop-color="#FFE052" />
                                    <stop offset="1" stop-color="#FFC331" />
                                </linearGradient>
                                <clipPath id="clip0_45_13174">
                                    <rect width="91.0306" height="83.2841" fill="white" transform="translate(0 0.817871)" />
                                </clipPath>
                            </defs>
                        </svg>
                    </div>
                    <div className="C">
                        <svg xmlns="http://www.w3.org/2000/svg" width="84" height="87" viewBox="0 0 84 87" fill="none">
                            <g clip-path="url(#clip0_45_13199)">
                                <path d="M14.8565 0.735603H69.0231C70.974 0.733683 72.9062 1.13341 74.709 1.91191C76.5117 2.6904 78.1497 3.83239 79.5293 5.2725C80.9088 6.71261 82.0027 8.42258 82.7484 10.3045C83.4942 12.1865 83.8771 14.2035 83.8752 16.2402V70.5973C83.8771 72.6339 83.4942 74.6509 82.7484 76.5329C82.0027 78.4148 80.9088 80.1248 79.5293 81.5649C78.1497 83.005 76.5117 84.147 74.709 84.9255C72.9062 85.704 70.974 86.1038 69.0231 86.1018H14.8565C12.9056 86.1038 10.9735 85.704 9.17069 84.9255C7.36792 84.147 5.7299 83.005 4.35039 81.5649C2.97087 80.1248 1.87695 78.4148 1.13121 76.5329C0.385469 74.6509 0.00256236 72.6339 0.00440112 70.5973V16.2402C0.00256236 14.2035 0.385469 12.1865 1.13121 10.3045C1.87695 8.42258 2.97087 6.71261 4.35039 5.2725C5.7299 3.83239 7.36792 2.6904 9.17069 1.91191C10.9735 1.13341 12.9056 0.733683 14.8565 0.735603Z" fill="#000B1D" />
                                <path d="M71.3652 60.7848C71.839 59.9494 72.1334 59.0082 72.1334 58.163V28.8233C72.1334 27.9781 71.8394 27.037 71.3654 26.2017L41.9399 43.4932L71.3652 60.7848Z" fill="#00599C" />
                                <path d="M44.5547 77.4425L69.5186 62.7728C70.2377 62.3502 70.8913 61.6205 71.3651 60.7849L41.9399 43.4933L12.5146 60.7851C12.9885 61.6205 13.6423 62.3504 14.3612 62.7728L39.3251 77.4425C40.7631 78.2878 43.1167 78.2878 44.5547 77.4425Z" fill="#004482" />
                                <path d="M71.3653 26.2015C70.8913 25.3659 70.2375 24.6362 69.5186 24.2136L44.5546 9.54383C43.1166 8.69861 40.7631 8.69861 39.325 9.54383L14.3611 24.2136C12.9229 25.0586 11.7463 27.1331 11.7463 28.8233V58.163C11.7463 59.0082 12.0406 59.9495 12.5146 60.7849L41.9398 43.4933L71.3653 26.2015Z" fill="#659AD2" />
                                <path d="M41.9398 63.9812C30.8406 63.9812 21.8108 54.7903 21.8108 43.4933C21.8108 32.1962 30.8406 23.0054 41.9398 23.0054C49.1018 23.0054 55.7812 26.9282 59.3713 33.2429L50.66 38.3737C48.8632 35.2129 45.5216 33.2493 41.9398 33.2493C36.3901 33.2493 31.8753 37.8446 31.8753 43.4933C31.8753 49.1417 36.3901 53.7372 41.9398 53.7372C45.522 53.7372 48.8636 51.7736 50.6606 48.6122L59.3719 53.7428C55.7818 60.0581 49.1022 63.9812 41.9398 63.9812Z" fill="white" />
                                <path d="M62.0688 42.355H59.8321V40.0786H57.5958V42.355H55.3591V44.6313H57.5958V46.9079H59.8321V44.6313H62.0688V42.355Z" fill="white" />
                                <path d="M70.456 42.355H68.2193V40.0786H65.983V42.355H63.7463V44.6313H65.983V46.9079H68.2193V44.6313H70.456V42.355Z" fill="white" />
                            </g>
                            <defs>
                                <clipPath id="clip0_45_13199">
                                    <rect width="83.8708" height="85.3662" fill="white" transform="translate(0.00439453 0.735596)" />
                                </clipPath>
                            </defs>
                        </svg>
                    </div>
                    <div className="JavaScript">
                        <svg xmlns="http://www.w3.org/2000/svg" width="94" height="90" viewBox="0 0 94 90" fill="none">
                            <g clip-path="url(#clip0_45_13196)">
                                <path d="M17.0909 0.530525H77.2026C79.3676 0.528535 81.5118 0.942886 83.5125 1.74986C85.5131 2.55684 87.3309 3.74061 88.8618 5.23341C90.3928 6.7262 91.6068 8.49874 92.4343 10.4496C93.2619 12.4004 93.6869 14.4912 93.6848 16.6023V72.9481C93.6869 75.0592 93.2619 77.1501 92.4343 79.1009C91.6068 81.0517 90.3928 82.8242 88.8618 84.317C87.3309 85.8098 85.5131 86.9936 83.5125 87.8006C81.5118 88.6075 79.3676 89.0219 77.2026 89.0199H17.0909C14.9258 89.0219 12.7816 88.6075 10.781 87.8006C8.78036 86.9936 6.96256 85.8098 5.43163 84.317C3.90071 82.8242 2.68672 81.0517 1.85913 79.1009C1.03154 77.1501 0.606609 75.0592 0.60865 72.9481V16.6023C0.606609 14.4912 1.03154 12.4004 1.85913 10.4496C2.68672 8.49874 3.90071 6.7262 5.43163 5.23341C6.96256 3.74061 8.78036 2.55684 10.781 1.74986C12.7816 0.942886 14.9258 0.528535 17.0909 0.530525Z" fill="#F7DF1E" />
                                <path d="M70.3324 73.2314C72.2072 76.1417 74.6464 78.2809 78.9604 78.2809C82.5844 78.2809 84.8995 76.5589 84.8995 74.1795C84.8995 71.3282 82.5209 70.3183 78.5319 68.6595L76.3454 67.7675C70.0339 65.2112 65.8411 62.0087 65.8411 55.2386C65.8411 49.0022 70.8391 44.2546 78.6501 44.2546C84.2111 44.2546 88.2089 46.0947 91.0898 50.9124L84.279 55.07C82.7795 52.5136 81.1617 51.5066 78.6501 51.5066C76.0883 51.5066 74.4647 53.0516 74.4647 55.07C74.4647 57.5646 76.0898 58.5745 79.8424 60.1195L82.0289 61.01C89.4603 64.0397 93.6561 67.1284 93.6561 74.0728C93.6561 81.5592 87.4702 85.6606 79.1628 85.6606C71.04 85.6606 65.7923 81.9806 63.2246 77.1572L70.3324 73.2314ZM39.4355 73.952C40.8095 76.2695 42.0594 78.229 45.0644 78.229C47.9379 78.229 49.7507 77.1601 49.7507 73.0039V44.7294H58.4969V73.1162C58.4969 81.7264 53.1871 85.6452 45.4367 85.6452C38.4338 85.6452 34.3784 82.1997 32.3159 78.0499L39.4355 73.952Z" fill="black" />
                            </g>
                            <defs>
                                <clipPath id="clip0_45_13196">
                                    <rect width="93.0762" height="88.4894" fill="white" transform="translate(0.608643 0.530518)" />
                                </clipPath>
                            </defs>
                        </svg>
                    </div>
                    <div className="Java">
                        <svg xmlns="http://www.w3.org/2000/svg" width="82" height="85" viewBox="0 0 82 85" fill="none">
                            <g clip-path="url(#clip0_45_13180)">
                                <path d="M14.6816 0.735602H66.8664C68.746 0.73373 70.6074 1.12371 72.3443 1.88322C74.0811 2.64272 75.6592 3.75685 76.9882 5.16184C78.3173 6.56683 79.3712 8.23509 80.0896 10.0712C80.8081 11.9072 81.177 13.875 81.1752 15.862V68.8933C81.177 70.8803 80.8081 72.8481 80.0896 74.6842C79.3712 76.5202 78.3173 78.1885 76.9882 79.5935C75.6592 80.9985 74.0811 82.1126 72.3443 82.8721C70.6074 83.6316 68.746 84.0216 66.8664 84.0197H14.6816C12.802 84.0216 10.9406 83.6316 9.20375 82.8721C7.46693 82.1126 5.88884 80.9985 4.5598 79.5935C3.23075 78.1885 2.17685 76.5202 1.45839 74.6842C0.739935 72.8481 0.371038 70.8803 0.372809 68.8933V15.862C0.371038 13.875 0.739935 11.9072 1.45839 10.0712C2.17685 8.23509 3.23075 6.56683 4.5598 5.16184C5.88884 3.75685 7.46693 2.64272 9.20375 1.88322C10.9406 1.12371 12.802 0.73373 14.6816 0.735602Z" fill="#F0F0F0" />
                                <path d="M56.6808 61.9799H56.437V61.8394H57.0933V61.9799H56.8512V62.6813H56.6808V61.9799ZM57.9898 62.0165H57.986L57.7445 62.6814H57.6339L57.394 62.0165H57.391V62.6814H57.2304V61.8395H57.4667L57.6892 62.4357L57.911 61.8395H58.1465V62.6814H57.9897V62.0165H57.9898Z" fill="#E76F00" />
                                <path d="M34.857 44.7635C34.857 44.7635 33.1609 45.7802 36.0641 46.1242C39.5813 46.5378 41.3789 46.4785 45.2549 45.7224C45.2549 45.7224 46.274 46.381 47.6971 46.9514C39.0082 50.7897 28.0323 46.7291 34.857 44.7635Z" fill="#5382A1" />
                                <path d="M33.7951 39.7548C33.7951 39.7548 31.8927 41.2062 34.7981 41.516C38.5553 41.9155 41.5225 41.9482 46.6568 40.9291C46.6568 40.9291 47.3669 41.6712 48.4836 42.077C37.9781 45.2433 26.2769 42.3267 33.7951 39.7548Z" fill="#5382A1" />
                                <path d="M42.7462 31.2583C44.8871 33.7989 42.1837 36.0852 42.1837 36.0852C42.1837 36.0852 47.6199 33.1926 45.1233 29.5705C42.7915 26.1926 41.0034 24.5142 50.6837 18.7275C50.6837 18.7275 35.4888 22.6391 42.7462 31.2583Z" fill="#E76F00" />
                                <path d="M54.2379 48.4684C54.2379 48.4684 55.4931 49.5344 52.8556 50.359C47.8402 51.925 31.981 52.3979 27.5754 50.4214C25.9917 49.7113 28.9616 48.7258 29.8958 48.519C30.8701 48.3013 31.4269 48.3418 31.4269 48.3418C29.6656 47.063 20.0429 50.8529 26.539 51.9382C44.2548 54.8995 58.8332 50.6048 54.2379 48.4684Z" fill="#5382A1" />
                                <path d="M35.6725 34.5652C35.6725 34.5652 27.6056 36.5401 32.8158 37.2572C35.0158 37.5608 39.4013 37.4921 43.4863 37.1394C46.8248 36.8491 50.177 36.2319 50.177 36.2319C50.177 36.2319 48.9998 36.7516 48.1481 37.351C39.9563 39.5716 24.1311 38.5385 28.6869 36.2671C32.5398 34.3474 35.6725 34.5652 35.6725 34.5652Z" fill="#5382A1" />
                                <path d="M50.1439 42.9025C58.4714 38.4423 54.6211 34.1561 51.9336 34.7336C51.2749 34.8749 50.9812 34.9973 50.9812 34.9973C50.9812 34.9973 51.2258 34.6025 51.6928 34.4316C57.0094 32.5051 61.0983 40.1137 49.9766 43.1273C49.9766 43.1274 50.1054 43.0086 50.1439 42.9025Z" fill="#5382A1" />
                                <path d="M45.1232 9.38354C45.1232 9.38354 49.735 14.1387 40.749 21.4507C33.5431 27.3162 39.1059 30.6605 40.746 34.4816C36.5398 30.57 33.4531 27.1266 35.5239 23.9219C38.5634 19.2176 46.9839 16.9368 45.1232 9.38354Z" fill="#E76F00" />
                                <path d="M36.4909 54.9885C44.4842 55.5159 56.7588 54.6959 57.0496 50.7975C57.0496 50.7975 56.4907 52.2753 50.4435 53.449C43.6211 54.7723 35.2066 54.6178 30.2158 53.7697C30.2159 53.7696 31.2375 54.6412 36.4909 54.9885Z" fill="#5382A1" />
                                <path d="M35.1809 69.8843C34.4269 70.5584 33.6305 70.9368 32.9158 70.9368C31.8957 70.9368 31.3445 70.3063 31.3445 69.2951C31.3445 68.2012 31.9351 67.4015 34.3042 67.4015H35.1808V69.8843H35.1809ZM37.2616 72.3039V64.814C37.2616 62.9006 36.2029 61.6381 33.6501 61.6381C32.1598 61.6381 30.8544 62.0174 29.7934 62.5011L30.0996 63.8269C30.935 63.5109 32.0164 63.2166 33.0778 63.2166C34.5483 63.2166 35.1809 63.8269 35.1809 65.0886V66.0352H34.447C30.8741 66.0352 29.2625 67.4647 29.2625 69.6104C29.2625 71.4621 30.3246 72.5147 32.3243 72.5147C33.6098 72.5147 34.5694 71.9677 35.4664 71.1671L35.6292 72.304H37.2616V72.3039Z" fill="#E76F00" />
                                <path d="M44.2055 72.304H41.6105L38.4873 61.8278H40.7535L42.6915 68.2644L43.1223 70.2002C44.1027 67.4014 44.796 64.5619 45.1429 61.8278H47.3473C46.7567 65.2775 45.6939 69.0641 44.2055 72.304Z" fill="#E76F00" />
                                <path d="M54.1605 69.8843C53.405 70.5584 52.6072 70.9368 51.8925 70.9368C50.8742 70.9368 50.3216 70.3063 50.3216 69.2951C50.3216 68.2012 50.9136 67.4015 53.2824 67.4015H54.1605V69.8843ZM56.241 72.3039V64.814C56.241 62.9006 55.1796 61.6381 52.6298 61.6381C51.1385 61.6381 49.8326 62.0174 48.772 62.5011L49.0778 63.8269C49.9136 63.5109 50.9969 63.2166 52.0575 63.2166C53.527 63.2166 54.1605 63.8269 54.1605 65.0886V66.0352H53.4254C49.8515 66.0352 48.2405 67.4647 48.2405 69.6104C48.2405 71.4621 49.3017 72.5147 51.3012 72.5147C52.5874 72.5147 53.5466 71.9677 54.4451 71.1671L54.6086 72.304H56.241V72.3039Z" fill="#E76F00" />
                                <path d="M26.981 74.0831C26.3879 74.9757 25.4299 75.6819 24.3811 76.0814L23.3538 74.8354C24.1521 74.4132 24.8367 73.7313 25.1548 73.0961C25.43 72.5313 25.5439 71.8033 25.5439 70.0623V58.1021H27.7545V69.8984C27.7543 72.226 27.5738 73.1662 26.981 74.0831Z" fill="#E76F00" />
                            </g>
                            <defs>
                                <clipPath id="clip0_45_13180">
                                    <rect width="80.8024" height="83.2841" fill="white" transform="translate(0.372803 0.735596)" />
                                </clipPath>
                            </defs>
                        </svg>
                    </div>
                    <div className="Ruby">
                        <svg xmlns="http://www.w3.org/2000/svg" width="87" height="87" viewBox="0 0 87 87" fill="none">
                            <g clip-path="url(#clip0_45_13232)">
                                <path d="M15.5003 0.694587H70.988C72.9865 0.692667 74.9658 1.09239 76.8125 1.87089C78.6592 2.64939 80.3372 3.79137 81.7504 5.23148C83.1635 6.6716 84.2841 8.38157 85.0481 10.2635C85.812 12.1455 86.2042 14.1625 86.2024 16.1991V70.5563C86.2042 72.5929 85.812 74.6099 85.0481 76.4919C84.2841 78.3738 83.1635 80.0838 81.7504 81.5239C80.3372 82.964 78.6592 84.106 76.8125 84.8845C74.9658 85.663 72.9865 86.0627 70.988 86.0608H15.5003C13.5018 86.0627 11.5225 85.663 9.67575 84.8845C7.82901 84.106 6.15104 82.964 4.73788 81.5239C3.32472 80.0838 2.20411 78.3738 1.44018 76.4919C0.676258 74.6099 0.284012 72.5929 0.285895 70.5563V16.1991C0.284012 14.1625 0.676258 12.1455 1.44018 10.2635C2.20411 8.38157 3.32472 6.6716 4.73788 5.23148C6.15104 3.79137 7.82901 2.64939 9.67575 1.87089C11.5225 1.09239 13.5018 0.692667 15.5003 0.694587Z" fill="#000B1D" />
                                <path fill-rule="evenodd" clip-rule="evenodd" d="M59.7803 52.8158L25.4751 73.0556L69.8939 70.0607L73.315 25.5582L59.7803 52.8158Z" fill="url(#paint0_linear_45_13232)" />
                                <path fill-rule="evenodd" clip-rule="evenodd" d="M69.9665 70.0304L66.1487 43.8485L55.7495 57.4924L69.9665 70.0304Z" fill="url(#paint1_linear_45_13232)" />
                                <path fill-rule="evenodd" clip-rule="evenodd" d="M70.018 70.0303L42.0483 67.8488L25.6235 72.9986L70.018 70.0303Z" fill="url(#paint2_linear_45_13232)" />
                                <path fill-rule="evenodd" clip-rule="evenodd" d="M25.6632 73.0045L32.6504 50.2607L17.2749 53.5274L25.6632 73.0045Z" fill="url(#paint3_linear_45_13232)" />
                                <path fill-rule="evenodd" clip-rule="evenodd" d="M55.7469 57.5678L49.3177 32.546L30.9187 49.6822L55.7469 57.5678Z" fill="url(#paint4_linear_45_13232)" />
                                <path fill-rule="evenodd" clip-rule="evenodd" d="M71.8562 32.8985L54.464 18.7845L49.6208 34.3418L71.8562 32.8985Z" fill="url(#paint5_linear_45_13232)" />
                                <path fill-rule="evenodd" clip-rule="evenodd" d="M63.7226 13.7526L53.4935 19.3692L47.04 13.6772L63.7226 13.7526Z" fill="url(#paint6_linear_45_13232)" />
                                <path fill-rule="evenodd" clip-rule="evenodd" d="M13.2292 61.1565L17.5144 53.3914L14.0481 44.1409L13.2292 61.1565Z" fill="url(#paint7_linear_45_13232)" />
                                <path fill-rule="evenodd" clip-rule="evenodd" d="M13.8176 43.8485L17.3052 53.6777L32.4593 50.2995L49.7605 34.3235L54.643 18.9142L46.955 13.5205L33.8843 18.3808C29.7663 22.1865 21.7753 29.7166 21.4872 29.8582C21.2021 30.0028 16.2104 39.3769 13.8176 43.8485Z" fill="white" />
                                <path fill-rule="evenodd" clip-rule="evenodd" d="M26.0635 26.191C34.9885 17.3985 46.4944 12.2037 50.9099 16.6301C55.3227 21.0565 50.643 31.8137 41.718 40.6033C32.7929 49.3928 21.4296 54.8739 17.0171 50.4474C12.6016 46.024 17.1384 34.9806 26.0635 26.191Z" fill="url(#paint8_linear_45_13232)" />
                                <path fill-rule="evenodd" clip-rule="evenodd" d="M25.6631 72.9955L32.5957 50.1794L55.6195 57.5287C47.2949 65.2847 38.0363 71.8415 25.6631 72.9955Z" fill="url(#paint9_linear_45_13232)" />
                                <path fill-rule="evenodd" clip-rule="evenodd" d="M49.7908 34.2785L55.7014 57.5406C62.6552 50.2757 68.8964 42.4654 71.953 32.8051L49.7908 34.2785Z" fill="url(#paint10_linear_45_13232)" />
                                <path fill-rule="evenodd" clip-rule="evenodd" d="M71.8926 32.9226C74.2581 25.8294 74.8039 15.6538 63.6496 13.7645L54.4971 18.7876L71.8926 32.9226Z" fill="url(#paint11_linear_45_13232)" />
                                <path fill-rule="evenodd" clip-rule="evenodd" d="M13.2292 61.054C13.5568 72.7606 22.0573 72.9351 25.6782 73.0378L17.3142 53.6294L13.2292 61.054Z" fill="#9E1209" />
                                <path fill-rule="evenodd" clip-rule="evenodd" d="M49.8237 34.3148C55.1672 37.5781 65.9364 44.1318 66.1548 44.2523C66.4942 44.4422 70.7978 37.0417 71.7743 32.8594L49.8237 34.3148Z" fill="url(#paint12_radial_45_13232)" />
                                <path fill-rule="evenodd" clip-rule="evenodd" d="M32.5867 50.1794L41.8544 67.9454C47.3344 64.9924 51.6256 61.3946 55.5559 57.5407L32.5867 50.1794Z" fill="url(#paint13_radial_45_13232)" />
                                <path fill-rule="evenodd" clip-rule="evenodd" d="M17.2777 53.6537L15.9646 69.1898C18.4423 72.5526 21.851 72.8448 25.4264 72.5827C22.8396 66.1856 17.672 53.3945 17.2777 53.6537Z" fill="url(#paint14_linear_45_13232)" />
                                <path fill-rule="evenodd" clip-rule="evenodd" d="M54.4429 18.8268L72.854 21.3941C71.8715 17.2569 68.854 14.5872 63.7106 13.7526L54.4429 18.8268Z" fill="url(#paint15_linear_45_13232)" />
                            </g>
                            <defs>
                                <linearGradient id="paint0_linear_45_13232" x1="66.0196" y1="78.47" x2="53.4668" y2="56.1646" gradientUnits="userSpaceOnUse">
                                    <stop stop-color="#FB7655" />
                                    <stop offset="0.41" stop-color="#E42B1E" />
                                    <stop offset="0.99" stop-color="#990000" />
                                    <stop offset="1" stop-color="#990000" />
                                </linearGradient>
                                <linearGradient id="paint1_linear_45_13232" x1="72.3338" y1="59.7907" x2="56.0631" y2="48.8017" gradientUnits="userSpaceOnUse">
                                    <stop stop-color="#871101" />
                                    <stop offset="0.99" stop-color="#911209" />
                                    <stop offset="1" stop-color="#911209" />
                                </linearGradient>
                                <linearGradient id="paint2_linear_45_13232" x1="59.2632" y1="79.1439" x2="42.993" y2="68.1552" gradientUnits="userSpaceOnUse">
                                    <stop stop-color="#871101" />
                                    <stop offset="0.99" stop-color="#911209" />
                                    <stop offset="1" stop-color="#911209" />
                                </linearGradient>
                                <linearGradient id="paint3_linear_45_13232" x1="24.9646" y1="51.9061" x2="27.4654" y2="68.2639" gradientUnits="userSpaceOnUse">
                                    <stop stop-color="white" />
                                    <stop offset="0.23" stop-color="#E57252" />
                                    <stop offset="0.46" stop-color="#DE3B20" />
                                    <stop offset="0.99" stop-color="#A60003" />
                                    <stop offset="1" stop-color="#A60003" />
                                </linearGradient>
                                <linearGradient id="paint4_linear_45_13232" x1="42.3829" y1="36.6366" x2="43.3041" y2="53.3265" gradientUnits="userSpaceOnUse">
                                    <stop stop-color="white" />
                                    <stop offset="0.23" stop-color="#E4714E" />
                                    <stop offset="0.56" stop-color="#BE1A0D" />
                                    <stop offset="0.99" stop-color="#A80D00" />
                                    <stop offset="1" stop-color="#A80D00" />
                                </linearGradient>
                                <linearGradient id="paint5_linear_45_13232" x1="57.8402" y1="21.2105" x2="60.5997" y2="33.1793" gradientUnits="userSpaceOnUse">
                                    <stop stop-color="white" />
                                    <stop offset="0.18" stop-color="#E46342" />
                                    <stop offset="0.4" stop-color="#C82410" />
                                    <stop offset="0.99" stop-color="#A80D00" />
                                    <stop offset="1" stop-color="#A80D00" />
                                </linearGradient>
                                <linearGradient id="paint6_linear_45_13232" x1="49.3103" y1="16.9983" x2="61.3166" y2="10.9564" gradientUnits="userSpaceOnUse">
                                    <stop stop-color="white" />
                                    <stop offset="0.54" stop-color="#C81F11" />
                                    <stop offset="0.99" stop-color="#BF0905" />
                                    <stop offset="1" stop-color="#BF0905" />
                                </linearGradient>
                                <linearGradient id="paint7_linear_45_13232" x1="14.413" y1="47.7371" x2="15.3912" y2="57.594" gradientUnits="userSpaceOnUse">
                                    <stop stop-color="white" />
                                    <stop offset="0.31" stop-color="#DE4024" />
                                    <stop offset="0.99" stop-color="#BF190B" />
                                    <stop offset="1" stop-color="#BF190B" />
                                </linearGradient>
                                <linearGradient id="paint8_linear_45_13232" x1="7.60207" y1="60.2568" x2="53.8671" y2="12.3768" gradientUnits="userSpaceOnUse">
                                    <stop stop-color="#BD0012" />
                                    <stop offset="0.07" stop-color="white" />
                                    <stop offset="0.17" stop-color="white" />
                                    <stop offset="0.27" stop-color="#C82F1C" />
                                    <stop offset="0.33" stop-color="#820C01" />
                                    <stop offset="0.46" stop-color="#A31601" />
                                    <stop offset="0.72" stop-color="#B31301" />
                                    <stop offset="0.99" stop-color="#E82609" />
                                    <stop offset="1" stop-color="#E82609" />
                                </linearGradient>
                                <linearGradient id="paint9_linear_45_13232" x1="43.275" y1="65.0567" x2="29.2574" y2="61.5747" gradientUnits="userSpaceOnUse">
                                    <stop stop-color="#8C0C01" />
                                    <stop offset="0.54" stop-color="#990C00" />
                                    <stop offset="0.99" stop-color="#A80D0E" />
                                    <stop offset="1" stop-color="#A80D0E" />
                                </linearGradient>
                                <linearGradient id="paint10_linear_45_13232" x1="67.3697" y1="48.3275" x2="54.979" y2="37.1505" gradientUnits="userSpaceOnUse">
                                    <stop stop-color="#7E110B" />
                                    <stop offset="0.99" stop-color="#9E0C00" />
                                    <stop offset="1" stop-color="#9E0C00" />
                                </linearGradient>
                                <linearGradient id="paint11_linear_45_13232" x1="71.9482" y1="27.9649" x2="65.7832" y2="21.3315" gradientUnits="userSpaceOnUse">
                                    <stop stop-color="#79130D" />
                                    <stop offset="0.99" stop-color="#9E120B" />
                                    <stop offset="1" stop-color="#9E120B" />
                                </linearGradient>
                                <radialGradient id="paint12_radial_45_13232" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(56.8481 37.4419) scale(15.2716 15.1738)">
                                    <stop stop-color="#A80D00" />
                                    <stop offset="0.99" stop-color="#7E0E08" />
                                    <stop offset="1" stop-color="#7E0E08" />
                                </radialGradient>
                                <radialGradient id="paint13_radial_45_13232" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(35.6989 57.4386) scale(20.3016 20.1716)">
                                    <stop stop-color="#A30C00" />
                                    <stop offset="0.99" stop-color="#800E08" />
                                    <stop offset="1" stop-color="#800E08" />
                                </radialGradient>
                                <linearGradient id="paint14_linear_45_13232" x1="21.3172" y1="72.9822" x2="16.3179" y2="55.9118" gradientUnits="userSpaceOnUse">
                                    <stop stop-color="#8B2114" />
                                    <stop offset="0.43" stop-color="#9E100A" />
                                    <stop offset="0.99" stop-color="#B3100C" />
                                    <stop offset="1" stop-color="#B3100C" />
                                </linearGradient>
                                <linearGradient id="paint15_linear_45_13232" x1="60.1264" y1="16.4729" x2="71.4439" y2="21.5008" gradientUnits="userSpaceOnUse">
                                    <stop stop-color="#B31000" />
                                    <stop offset="0.44" stop-color="#910F08" />
                                    <stop offset="0.99" stop-color="#791C12" />
                                    <stop offset="1" stop-color="#791C12" />
                                </linearGradient>
                                <clipPath id="clip0_45_13232">
                                    <rect width="85.9165" height="85.3662" fill="white" transform="translate(0.285889 0.69458)" />
                                </clipPath>
                            </defs>
                        </svg>
                    </div>
                    {/* <div class="DropdownBox">
                            <div class="Header">
                            <div class="Select">Select</div>
                            <div class="IconsRegularChevronDownS">
                                <div class="Icon"></div>
                            </div>
                            </div>
                            <div class="ItemsFrame"></div>
                        </div> */}
                </div>



                <div className='Rectangle2'>

                    <CodeEditorWindow />
                    {/* <div class="Card">
        <div class="Content2" >
            <div class="Text2" >
            <div class="text2">1<br/>2<br/>3<br/>4<br/>5<br/>6<br/>7<br/>8<br/>9<br/>10<br/>11<br/>12<br/>13<br/>14<br/>15<br/>16<br/>17<br/>18<br/>19<br/>20<br/>21<br/>22<br/>23<br/>24<br/>25<br/>26<br/>27<br/>28<br/>29<br/>30</div>
            <div class="text2"><span><br/>To use this tool, take the following steps —<br/><br/></span><span>Select the programming language from the dropdown above<br/>﻿﻿Describe the code you want to generate here in this box<br/>﻿﻿﻿Click Generate</span></div>
            </div>
        </div>
        <div class="Group" >
            <div class="Button" >
            <div class="Iconset" >
                <div class="Clipboard" >
                <div class="Vector" ></div>
                <div class="Vector" ></div>
                </div>
            </div>
            </div>
            <div class="Button">
            <div class="Iconset">
                <div class="Clipboard" >
                <div class="Vector" ></div>
                </div>
            </div>
            </div>
        </div>
       </div>
       
       <div class="Card2" >
            <div class="Content22" >
                <div class="Text22" >
                <div class="text22" >1<br/>2<br/>3<br/>4<br/>5<br/>6<br/>7<br/>8<br/>9<br/>10<br/>11<br/>12<br/>13<br/>14<br/>15<br/>16<br/>17<br/>18<br/>19<br/>20<br/>21<br/>22<br/>23<br/>24<br/>25<br/>26<br/>27<br/>28<br/>29<br/>30</div>
                <div class="text22"><span>// Type some code 
                <br/></span><span><br/></span></div>
                </div>
            </div>
            <div class="Group2">
                <div class="Button2" >
                <div class="Iconset2" >
                    <div class="Clipboard2">
                    <div class="Vector"></div>
                    <div class="Vector" ></div>
                    </div>
                </div>
                </div>
                <div class="Button2" >
                <div class="Iconset2" >
                    <div class="Arrowsoutsimple" >
                    <div class="Vector" ></div>
                    </div>
                </div>
                </div>
            </div>
        </div> */}

                </div>




            </div>
        </>
    );
};

// Export the HomePage component
export default CodeConvertPage;
