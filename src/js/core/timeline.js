/*
===============================================================
Table of Contents (*TOC)
===============================================================
1. JSPsych Init, and onFinish (*sec_init)
2. Introduction Section (*sec_intro)
    2a. Push Intro Trials to timeline_intro (*push_intro)
3. Instruction Section + Demo Trials (*sec_instr)
    3a. Set Preload Images for Instr + Demo (*preload_instr)
    3b. Push Instr Trials to timeline_instr (*push_instr)
4. Experiment Section (*sec_expt)
    4a. Define Factors + Expt Design (*factors)
    4b. Set Preload Images for Experiment
    4c. Determine Expt Trials + logic (*exptTrials)
5. Closing Section (*sec_closing)
6. Run Expt (*sec_run)
    6a. Define Preload plugin
    6b. Combine all timelines


*/

/*
===============================================================
JSPsych Init, and onFinish (*sec_init)
===============================================================
*/

/* initialize jsPsych */
var jsPsych = initJsPsych({
    on_trial_finish: function(data) {
        // console.log(JSON.stringify(data));
        data.participant_id = workerID;
        
        // Process data through WAVE client if available
        if (window.waveClient) {
            window.waveClient.processTrialData(data);
        }
    },
    on_finish: function() {
        // Handle experiment completion through WAVE client if available
        if (window.waveClient) {
            window.waveClient.handleCompletion();
        } else {
            jsPsych.data.displayData();
        }
    },
    on_interaction_data_update: function () {
        var interaction_data = jsPsych.data
            .getInteractionData()
            .last(1)
            .values()[0].event;
        if (interaction_data == 'fullscreenexit') {
            console.log('Fullscreen Exit detected');
            full_check = false;
        } else if (interaction_data == 'fullscreenenter') {
            console.log('Fullscreen problem now solved');
            full_check = true;
        }
    },
});

/*
===============================================================
Introduction Section (*sec_intro)
===============================================================
*/

var welcome = {
    type: jsPsychHtmlButtonResponse,
    stimulus: function() {
        return welcometext();
    },
    choices: ['Next'],
    data: {
        trial_category: 'welcome',
        screenWidth: String(w),
        screenHeight: String(h),
        clock: function () {
            var startTime = new Date().toLocaleString('en-US', {
                timeZone: 'America/New_York',
            });
            console.log('Start Time' + startTime);
            return startTime;
        }, // clock ends
    }, // data ends
    on_finish: function() {
        if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
            console.log("Uh oh, this is a mobile device");
        } else {
            console.log("Desktop device");
        }
    }, // on_finish ends
};

var consent = {
    type: jsPsychHtmlKeyboardResponse,
    choices: ['y'],
    stimulus: consentForm(participantType),
    prompt: '<h3>PRESS THE Y KEY TO CONSENT</h3><p></p><p></p>',
    data: { trial_category: 'consent' },
};

// First check for PROLIFIC_PID, then participant_id, then randomly generate id for now
var workerID = getURLParameter('PROLIFIC_PID');
if (workerID === 'no_query') {
    workerID = getURLParameter('participant_id');
}

if (workerID !== 'no_query') {
    console.log('Worker singID captured from URL:', workerID);
} else {
    workerID = 'no_query_worker'+ Math.floor(Math.random() * 90000 + 10000);
    console.warn('⚠️ No participant ID found in URL - randomly generated:', workerID);
}

var id = {
    type: jsPsychSurveyHtmlForm,
    html: requestIDinput(participantType, workerID),
    button_label: ['Submit'],
    data: { trial_category: 'id_info' },
    on_finish: function (data) {
        var respObj = data.response;
        for (var key in respObj) {
            if (respObj[key] == workerID) {
                console.log(
                    'The manual type matches the query capture, going with query input.',
                );
            } else if (workerID.startsWith('no_query')) {
                console.log(
                    `The query was not successfully captured, or there was nothing to query, now going to add the manual input to the end of the no query. workerID now = ${workerID + respObj[key]}`,
                );
                workerID = workerID + respObj[key];
            } else {
                console.log(
                    'The manual type differed from the query capture, and for some reason no_query was no generated, so going with manual input, whatever it is. If this happens, something has gone wrong.',
                );
                workerID = respObj[key];
            }
        } /*end of for loop*/
        // Retroactively update all prior trials with the finalized workerID
        jsPsych.data.get().addToAll({participant_id: workerID});
    } /*end of on_finish*/,
}; /* end of id*/

/* ------- timeline intro push (*push_intro) -------------- */
timelineintro.push(welcome);
timelineintro.push(consent);
timelineintro.push(id);
timelineintro.push({
    type: jsPsychFullscreen,
    fullscreen_mode: true,
    message: fullscreenMessage,
    on_finish: function () {
        full_check = true;
    },
});

/*
===============================================================
INSTR PROCEDURE (*sec_instr)
===============================================================
*/

/* -------  Set Preload Images for Instr + Demo (*preload_instr) -------------- */

// forPreload.push(`${stimFolder}demo-circles.png`);
// make sure to load any images you need for the demo itself. Usually you have different demo images than the main expt, such that you don't give away the content of the expt itself (but still give the participant practice and familiarity with the task. In this case, though, the demo images themselves are identical to the main expt. Variable names are the only difference.
//var demo_circle_colors = ["blue","orange"];
//var demo_display_durations = [200, 500];
//for (var i = 0; i < demo_circle_colors.length; i++) {
//    forPreload.push(`${stimFolder}${demo_circle_colors[i]}-circle.png`);
// }

//decide what the parameters for the demo trial should be. Sometimes you hardcode this, sometimes you randomly choose from the options you defined above.
//var thisDemoCircle = randomChoice(demo_circle_colors,1)[0];
//var thisDemoDispDuration = randomChoice(demo_display_durations,1)[0];

/* -------  Push Instr + Demo Trials to timeline_instr (*push_instr) -------------- */
var instrContent = loadInstrContent();
var memorize_numberTrialIndex = 5;
var [instrContent_beforedemo,instrContent_afterdemo] = cutArray(instrContent,memorize_numberTrialIndex);

var instructions1 = {
    type: jsPsychInstructions,
    pages: instrContent_beforedemo,
    show_clickable_nav: true,
    allow_keys: false,
    allow_backward: false,
    delay_time: function(){
        const calculated_delays = [];
        for (let i = 0; i < instrContent.length; i++) {
            calculated_delays.push(calculate_delay_time(count_words(instrContent_beforedemo[i]),60));
        }
        console.log(calculated_delays)
        return calculated_delays
    }, // end delay_time
};

var instructions2 = {
    type: jsPsychInstructions,
    pages: instrContent_afterdemo,
    show_clickable_nav: true,
    allow_keys: false,
    allow_backward: false,
    delay_time: function(){
        const calculated_delays = [];
        for (let i = 0; i < instrContent_afterdemo.length; i++) {
            calculated_delays.push(calculate_delay_time(count_words(instrContent_afterdemo[i]),60));
        }
        console.log(calculated_delays)
        return calculated_delays
    }, // end delay_time
};

var memorize_number_trial = {
        type: jsPsychHtmlKeyboardResponse,
        stimulus: `<p> Memorize this number:</p><h1>6083</h1>`,
        choices: "NO_KEYS",
        trial_duration: 8000,
        data: {
            trial_category: 'memorize_number_trial',
        }
    };


timelineinstr.push(instructions1);
timelineinstr.push(memorize_number_trial);
// runSingleTrial(thisDemoCircle,thisDemoDispDuration,timelineinstr,"prac") // pushesyour demo trial (COMMENTED OUT ON PURPOSE)
// timelineinstr.push(instructions2);

/*
===============================================================
EXPERIMENT SECTION (*sec_expt)
===============================================================
*/

/* -------- defining factors && exptdesign (*factors) --------*/
var poss_objects = ["A", "B", "C", "D"];
var poss_shadows = ["A", "B", "C", "D"];
var poss_disp_duration = [500, 700, 900];

var test_objects = ["A", "B"]
var test_shadows = ["A", "B", "C", "D"]

var factors = {
    object: test_objects,
    shadow: test_shadows,
    disp_duration: poss_disp_duration
};

var full_design = jsPsych.randomization.factorial(factors, 1);

full_design = full_design.filter(permutation => permutation.object !== permutation.shadow);

console.log(full_design);

/* -------  Set Preload Images for Expt (*preload_expt) -------------- */
for (var i = 0; i < poss_objects.length; i++){
    for (var j = 0; j < poss_shadows.length; j++){
        forPreload.push(`${stimFolder}obj${poss_objects[i]}_sha${poss_shadows[j]}.png`)
    }
};
forPreload.push(`${stimFolder}frame.png`); // preload frame for instructions!
forPreload.push(`${stimFolder}mask_v3.png`); // preload isi mask for viewing

/* ------- timeline expt push (*pushExpt ) -------------- */
for (var elem = 0; elem < 1; elem++) {
    runSingleTrial(
        full_design[elem].object,
        full_design[elem].shadow,
        full_design[elem].disp_duration,
        timelineexpt,
        'expt',
    );
}

/*
===============================================================
CLOSING SECTION (*sec_closing)
===============================================================
*/

var feedback_summary = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: function() {

    var trialAcc = jsPsych.data.get().filter({trial_category: 'number_memory_response'}).select("thisAcc").values; 
    console.log(trialAcc)
    if (trialAcc[0] == 1) {
        return `<p> You correctly recalled the number! Great! </p><p>Press the spacebar to continue.</p>`
    } else {
        return `<p> Unfortunately, the reported number was incorrect. Don't worry, we designed it to be difficult! </p><p>Press the spacebar to continue.</p>`
    }
    
    // var accuracy = Math.round(correct_trials.count() / trials.count() * 100);
    // var rt = Math.round(correct_trials.select('rt').mean());

    // return `<p>You responded correctly on ${accuracy}% of the trials.</p>
    //     <p>Your average response time was ${rt}ms.</p>
    //     <p>Press any key to continue to the next part of the study.</p>`;
    }
}; //end feedback_summary

var debrief_qs = {
    type: jsPsychSurveyHtmlForm,
    html: debriefForm(),
    button_label: ['Submit'],
    data: {
        trial_category: 'debriefexpt',
        endTime: function () {
            var endTime = new Date().toLocaleString('en-US', {
                timeZone: 'America/New_York',
            });
            console.log('End Time' + endTime);
            return endTime;
        },
    } // data ends
}

var closing = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: closingText(participantType),
    choices: [' '],
    data: { trial_category: 'closing' },
    on_finish: function(){
        if (participantType == 'prolific') {
            window.open(prolific_url, '_blank');
        }
    }, // on finish complete
};

timelineclose.push(feedback_summary);
//timelineclose.push(debrief_qs);
timelineclose.push({ type: jsPsychFullscreen, fullscreen_mode: false });
timelineclose.push(closing);

/*
===============================================================
Run Expt (*sec_run)
===============================================================
*/

if (runPreload) {
    var preload = {
        type: jsPsychPreload,
        images: forPreload,
    }
    timelinebase = timelinebase.concat(preload);
}

if (runIntro) { timelinebase = timelinebase.concat(timelineintro) }
if (runInstr) { timelinebase = timelinebase.concat(timelineinstr) }
if (runExpt) { timelinebase = timelinebase.concat(timelineexpt) }
if (runClose) { timelinebase = timelinebase.concat(timelineclose) }

jsPsych.run(timelinebase);