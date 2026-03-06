/*
===============================================================
PUSHING/RUNNING A CUSTOM SINGLE TRIAL (*singleTrial)
===============================================================
*/
function runSingleTrial(
    target_object,
    target_shadow,
    stimDuration,
    timelineTrialsToPush,
    trialType,
) {

    /*--------------------------- General Utility ---------------------------*/
    var checkScreen = {
        type: jsPsychFullscreen,
        message:
            '<p>Unfortunately, it appears you are no longer in fullscreen mode. Please make sure to remain in fullscreen mode. <br>Click on the button to fullscreen the experiment again and proceed.</p>',
        fullscreen_mode: true,
        button_label: 'Resume',
    };

    var if_notFull = {
        timeline: [checkScreen],
        conditional_function: function () {
            if (full_check == false) {
                return true;
            } else {
                return false;
            }
        },
    };

    var cursor_off = {
        type: jsPsychCallFunction,
        func: function () {
            document.body.style.cursor = 'none';
        },
    };

    var cursor_on = {
        type: jsPsychCallFunction,
        func: function () {
            document.body.style.cursor = 'auto';
        },
    };

    /*--------------------------- Experiment specific variables ---------------------------*/
    var thisTarget = `${stimFolder}obj${target_object}_sha${target_shadow}.png`;
    var persistent_prompt = `<div style="position: fixed; top: 50px; left: 50%; transform: translateX(-50%); text-align: center;"></div>`;

    var input_number = {
        type: jsPsychSurveyHtmlForm,
        preamble: '<p>To the best of your ability, please type the number you were told to memorize in the box below: </p>',
        html: '<h1><input name="first" type="number"/></h1>',
        data: {trial_category: "number_memory_response"
        }, 
        on_finish: function (data) {
            var respObj = data.response;
            for (var key in respObj) {
                if (respObj[key] == "6083") {
                    console.log(
                        'The input is consistent with 6083',
                    );
                    data.thisAcc = 1
                } else {
                    console.log(
                        'The input is inconsistent with 6083',
                    );
                    data.thisAcc = 0
                };
            }; //end for loop
        }, //end on_finish
    }; //end var input_number

    var dispImage = {
        type: jsPsychImageKeyboardResponse,
        stimulus: thisTarget,
        choices: "NO_KEYS",
        stimulus_width: imgWidth,
        trial_duration: stimDuration,
        data: {
            trial_category: 'dispImage' + trialType,
        }
    }; // dispImage end

    var prestim = {
        type: jsPsychHtmlKeyboardResponse,
        stimulus: `${persistent_prompt}`,
        choices: "NO_KEYS",
        trial_duration: PRESTIM_DISP_TIME,
        data: {
            trial_category: 'prestim_ISI' + trialType,
        }
    };

    var mask = {
        type: jsPsychHtmlKeyboardResponse,
        stimulus: `${persistent_prompt}<img src="${stimFolder}mask_v3.png" style="width: ${imgWidth}px;">`,
        choices: "NO_KEYS",
        trial_duration: MASK_DISP_TIME,
        data: {
            trial_category: 'mask' + trialType,
        }
    };

    var fixation = {
        type: jsPsychHtmlKeyboardResponse,
        stimulus: `${persistent_prompt}<img src="${stimFolder}frame.png" style="width: ${1.31*imgWidth}px;">`, //1.31 so frame fits around image
        choices: "NO_KEYS",
        trial_duration: FIXATION_DISP_TIME,
        data: {
            trial_category: 'fixation' + trialType,
        }
    };

    var poss_AFCchoices = [
            `<img src="${stimFolder}objA_shaA.png" style="width: ${imgWidth}px;">`,
            `<img src="${stimFolder}objB_shaB.png" style="width: ${imgWidth}px;">`,
            `<img src="${stimFolder}objC_shaC.png" style="width: ${imgWidth}px;">`,
            `<img src="${stimFolder}objD_shaD.png" style="width: ${imgWidth}px;">`,
        ];
    
    var shuffled_AFCchoices = shuffle(poss_AFCchoices);

    var afc_trial = {
        type: jsPsychHtmlButtonResponse,
        stimulus: `<h1>Select the image you saw:</h1>`,
        choices: shuffled_AFCchoices,
        button_html: `<button style="background-color: #afafaf; border-width: 5px; border-radius: 14px; margin-bottom: 10px;" class="jspsych-btn image-choice">%choice%</button>`,
        data: {
            afc_order: function(){
                console.log(JSON.stringify(shuffled_AFCchoices))
                return JSON.stringify(shuffled_AFCchoices)
            },
            target_object: target_object,
            target_shadow: target_shadow,
            trial_category: "afc" + trialType
        },
        trial_duration: null, 
        on_finish: function(data){
            if (data.response == null) {
                data.chosen_image = "timedout"
            } else {
                chosen_path = shuffled_AFCchoices[data.response]
                const shorter_chosen = chosen_path.match(/obj[^.]*/)?.[0];
                data.chosen_image = shorter_chosen;
            }
        }
    }; // end afc_trial

    /*--------------------------- push single trial sequence ---------------------------*/

    timelineTrialsToPush.push(if_notFull);
    timelineTrialsToPush.push(cursor_off);
    timelineTrialsToPush.push(prestim);
    timelineTrialsToPush.push(fixation);
    timelineTrialsToPush.push(dispImage);
    timelineTrialsToPush.push(mask);
    timelineTrialsToPush.push(cursor_on);
    timelineTrialsToPush.push(input_number);
    timelineTrialsToPush.push(cursor_off);
    timelineTrialsToPush.push(afc_trial);
    timelineTrialsToPush.push(cursor_on);

}