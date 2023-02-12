var CountTime = 0;
var PointCalibrate = 0;
var CalibrationPoints = {};
var i = 0;
var intervalId;

function ClearCanvas() {
  $(".Calibration").hide();
  var canvas = document.getElementById("plotting_canvas");
  canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
}

/**
 * Show the instruction of using calibration at the start up screen.
 */
function PopUpInstruction() {
  ClearCanvas();
  swal({
    title: "Calibration",
    text: "คลิกจุดที่ปรากฏบริเวณหน้าจอทั้ง 9 จุด \n คลิกทั้งหมด 5 ครั้งจนกระทั่งจุดเปลี่ยนเป็นสีเขียวเพื่อเป็นการปรับความแม่นยำของดวงตา",
    buttons: {
      cancel: false,
      confirm: true,
    },
  }).then((isConfirm) => {
    ShowCalibrationPoint();
  });
}
/**
 * Show the help instructions right at the start.
 */
function helpModalShow() {
  $("#helpModal").modal("show");
}
/**
 * Load this function when the index page starts.
 * This function listens for button clicks on the html page
 * checks that all buttons have been clicked 5 times each, and then goes on to measuring the precision
 */

$(document).ready(function () {
  ClearCanvas();
  helpModalShow();
  $(".Calibration").click(function () {
    var id = $(this).attr("id");

    if (!CalibrationPoints[id]) {
      // initialises if not done
      CalibrationPoints[id] = 0;
    }
    CalibrationPoints[id]++; // increments values

    if (CalibrationPoints[id] == 5) {
      //only turn to green after 5 clicks
      $(this).css("background-color", "Green");
      $(this).prop("disabled", true); //disables the button
      PointCalibrate++;
    } else if (CalibrationPoints[id] < 5) {
      //Gradually increase the opacity of calibration points when click to give some indication to user.
      var opacity = 0.2 * CalibrationPoints[id] + 0.2;
      $(this).css("opacity", opacity);
    }

    //Show the middle calibration point after all other points have been clicked.
    if (PointCalibrate == 8) {
      $("#Pt5").show();
    }

    if (PointCalibrate >= 9) {
      // last point is calibrated
      //using jquery to grab every element in Calibration class and hide them except the middle point.
      $(".Calibration").hide();
      $("#Pt5").show();

      // clears the canvas
      var canvas = document.getElementById("plotting_canvas");
      canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);

      // notification for the measurement process
      swal({
        title: "Calculating measurement",
        text: "โปรดอย่าขยับเมาส์ & จ้องที่จุดสีดขียวตรงกลาง 5 วินาที เพื่อคำนวณหาความแม่นยำในการติดตามการเคลื่อนที่ของตา",
        closeOnEsc: false,
        allowOutsideClick: false,
        closeModal: true,
      }).then((isConfirm) => {
        // makes the variables true for 5 seconds & plots the points
        $(document).ready(function () {
          store_points_variable(); // start storing the prediction points

          sleep(5000).then(() => {
            webgazer.pause();
            stop_storing_points_variable(); // stop storing the prediction points
            var past50 = webgazer.getStoredPoints(); // retrieve the stored points
            var precision_measurement = calculatePrecision(past50);
            var accuracyLabel =
              "<a>Accuracy | " + precision_measurement + "%</a>";
            document.getElementById("Accuracy").innerHTML = accuracyLabel; // Show the accuracy in the nav bar.
            swal({
              title: "Your accuracy measure is " + precision_measurement + "%",
              allowOutsideClick: false,
              buttons: {
                cancel: "Recalibrate",
                confirm: true,
              },
            }).then((isConfirm) => {
              if (isConfirm) {
                window.location.href = "fixation.html";
                var csv = arr.map((fields) => fields.join(",")).join("\n");
                var dl = "data:text/csv;charset=utf-8," + csv;
                window.open(encodeURI(dl));
              }

              async function f1() {
                latestGazeData = await latestGazeData;
              }

              async function callback() {
                latestGazeData = await latestGazeData;
                return callback(latestGazeData, elapsedTime, true);
              }

              if (csvDB === true) {
                csvDB = false;

                var csv = arr.map((fields) => fields.join(",")).join("\n");
                var dl = "data:text/csv;charset=utf-8," + csv;
                window.open(encodeURI(dl));
              }

              if (isConfirm) {
                //clear the calibration & hide the last middle button
                ClearCanvas();
              } else {
                //use restart function to restart the calibration
                document.getElementById("Accuracy").innerHTML =
                  "<a>Not yet Calibrated</a>";
                webgazer.clearData();
                ClearCalibration();
                ClearCanvas();
                ShowCalibrationPoint();
              }
            });
          });
        });
      });
    }
  });
});

/**
 * Show the Calibration Points
 */
function ShowCalibrationPoint() {
  $(".Calibration").show();
  $("#Pt5").hide(); // initially hides the middle button
}

/**
 * This function clears the calibration buttons memory
 */
function ClearCalibration() {
  // Clear data from WebGazer

  $(".Calibration").css("background-color", "yellow");
  $(".Calibration").css("opacity", 0.2);
  $(".Calibration").prop("disabled", false);

  CalibrationPoints = {};
  PointCalibrate = 0;
}

// sleep function because java doesn't have one, sourced from http://stackoverflow.com/questions/951021/what-is-the-javascript-version-of-sleep
function sleep(time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}
