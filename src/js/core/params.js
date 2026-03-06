/*
===============================================================
Defining Parameter Variables
===============================================================
*/

var stimFolder = 'src/assets/stimuli/renders/'


var runIntro = true;
var runInstr = true;
var runExpt = true;
var runClose = true;
var runPreload = true;

// Defining Core Variables that remain constant
var PRESTIM_DISP_TIME = 800;
var FIXATION_DISP_TIME = 2500;
var MASK_DISP_TIME = 300;
// var AFC_TIME = 10000

// Variables for Participant Information
var estTotalRunTime = 3;
var estDollars = 0.42;
var participantType = 'prolific';
var completionCode = 'C31LNN84';
var prolific_url = 'https://app.prolific.co/submissions/complete?cc='+completionCode;

// WAVE Backend Configuration
var waveBackendUrl = 'https://wave-backend-production-8781.up.railway.app';
// var waveBackendUrl = 'http://localhost:8000';  // For local development

// initializing variables
var timelinebase = [];
var timelineintro = [];
var timelineinstr = [];
var timelineexpt = [];
var timelineclose = [];
var forPreload = [];
var full_check = false;
var w =
    window.screen.width ||
    window.innerWidth ||
    document.documentElement.clientWidth ||
    document.body.clientWidth;
var h =
    window.screen.height ||
    window.innerHeight ||
    document.documentElement.clientHeight || 
    document.body.clientHeight;

// setting display image width
var origWidth = 1920;
var origHeight = 1080;

if (w < 1000){ //if the participant's screen is abnormally small, set the image to scale to ~40% of their screen dimenstions
    var imgWidth = 0.4*w
    var imgHeight = (imgWidth / origWidth) * origHeight;
} else { 
    var imgWidth = 500; // your desired display img width (NOTE THE DEFAULT IS 150 PX)
    var imgHeight = (imgWidth / origWidth) * origHeight;
}

