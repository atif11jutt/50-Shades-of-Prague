(function ($) {
  $(function () {
    try {
      if (typeof _wpcf7 == "undefined" || _wpcf7 === null) _wpcf7 = {};

      _wpcf7 = $.extend({ cached: 0 }, _wpcf7);

      $("div.wpcf7 > form").ajaxForm({
        beforeSubmit: function (formData, jqForm, options) {
          jqForm.wpcf7ClearResponseOutput();
          jqForm.find("img.ajax-loader").css({ visibility: "visible" });
          return true;
        },
        beforeSerialize: function (jqForm, options) {
          jqForm
            .find(".wpcf7-use-title-as-watermark.watermark")
            .each(function (i, n) {
              $(n).val("");
            });
          return true;
        },
        data: { _wpcf7_is_ajax_call: 1 },
        dataType: "json",
        success: function (data) {
          var ro = $(data.into).find("div.wpcf7-response-output");
          $(data.into).wpcf7ClearResponseOutput();

          $(data.into)
            .find(".wpcf7-form-control")
            .removeClass("wpcf7-not-valid");
          $(data.into)
            .find("form.wpcf7-form")
            .removeClass("invalid spam sent failed");

          if (data.captcha) $(data.into).wpcf7RefillCaptcha(data.captcha);

          if (data.quiz) $(data.into).wpcf7RefillQuiz(data.quiz);

          if (data.invalids) {
            $.each(data.invalids, function (i, n) {
              $(data.into).find(n.into).wpcf7NotValidTip(n.message);
              $(data.into)
                .find(n.into)
                .find(".wpcf7-form-control")
                .addClass("wpcf7-not-valid");
            });

            ro.addClass("wpcf7-validation-errors");
            $(data.into).find("form.wpcf7-form").addClass("invalid");

            $(data.into).trigger("invalid.wpcf7");
          } else if (1 == data.spam) {
            ro.addClass("wpcf7-spam-blocked");
            $(data.into).find("form.wpcf7-form").addClass("spam");

            $(data.into).trigger("spam.wpcf7");
          } else if (1 == data.mailSent) {
            ro.addClass("wpcf7-mail-sent-ok");
            $(data.into).find("form.wpcf7-form").addClass("sent");

            if (data.onSentOk)
              $.each(data.onSentOk, function (i, n) {
                eval(n);
              });

            $(data.into).trigger("mailsent.wpcf7");
          } else {
            ro.addClass("wpcf7-mail-sent-ng");
            $(data.into).find("form.wpcf7-form").addClass("failed");

            $(data.into).trigger("mailfailed.wpcf7");
          }

          if (data.onSubmit)
            $.each(data.onSubmit, function (i, n) {
              eval(n);
            });

          $(data.into).trigger("submit.wpcf7");

          if (1 == data.mailSent)
            $(data.into).find("form").resetForm().clearForm();

          $(data.into)
            .find(".wpcf7-use-title-as-watermark.watermark")
            .each(function (i, n) {
              $(n).val($(n).attr("title"));
            });

          $(data.into).wpcf7FillResponseOutput(data.message);
        },
      });

      $("div.wpcf7 > form").each(function (i, n) {
        if (_wpcf7.cached) $(n).wpcf7OnloadRefill();

        $(n).wpcf7ToggleSubmit();

        $(n).find(".wpcf7-submit").wpcf7AjaxLoader();

        $(n)
          .find(".wpcf7-acceptance")
          .click(function () {
            $(n).wpcf7ToggleSubmit();
          });

        $(n)
          .find(".wpcf7-exclusive-checkbox")
          .each(function (i, n) {
            $(n)
              .find("input:checkbox")
              .click(function () {
                $(n).find("input:checkbox").not(this).removeAttr("checked");
              });
          });

        $(n)
          .find(".wpcf7-use-title-as-watermark")
          .each(function (i, n) {
            var input = $(n);
            input.val(input.attr("title"));
            input.addClass("watermark");

            input.focus(function () {
              if ($(this).hasClass("watermark"))
                $(this).val("").removeClass("watermark");
            });

            input.blur(function () {
              if ("" == $(this).val())
                $(this).val($(this).attr("title")).addClass("watermark");
            });
          });
      });
    } catch (e) {}
  });

  $.fn.wpcf7AjaxLoader = function () {
    return this.each(function () {
      var loader = $('<img class="ajax-loader" />')
        .attr({ src: _wpcf7.loaderUrl, alt: _wpcf7.sending })
        .css("visibility", "hidden");

      $(this).after(loader);
    });
  };

  $.fn.wpcf7ToggleSubmit = function () {
    return this.each(function () {
      var form = $(this);
      if (this.tagName.toLowerCase() != "form")
        form = $(this).find("form").first();

      if (form.hasClass("wpcf7-acceptance-as-validation")) return;

      var submit = form.find("input:submit");
      if (!submit.length) return;

      var acceptances = form.find("input:checkbox.wpcf7-acceptance");
      if (!acceptances.length) return;

      submit.removeAttr("disabled");
      acceptances.each(function (i, n) {
        n = $(n);
        if (
          (n.hasClass("wpcf7-invert") && n.is(":checked")) ||
          (!n.hasClass("wpcf7-invert") && !n.is(":checked"))
        )
          submit.attr("disabled", "disabled");
      });
    });
  };

  $.fn.wpcf7NotValidTip = function (message) {
    return this.each(function () {
      var into = $(this);
      into.append('<span class="wpcf7-not-valid-tip">' + message + "</span>");
      $("span.wpcf7-not-valid-tip").mouseover(function () {
        $(this).fadeOut("fast");
      });
      into.find(":input").mouseover(function () {
        into.find(".wpcf7-not-valid-tip").not(":hidden").fadeOut("fast");
      });
      into.find(":input").focus(function () {
        into.find(".wpcf7-not-valid-tip").not(":hidden").fadeOut("fast");
      });
    });
  };

  $.fn.wpcf7OnloadRefill = function () {
    return this.each(function () {
      var url = $(this).attr("action");
      if (0 < url.indexOf("#")) url = url.substr(0, url.indexOf("#"));

      var id = $(this).find('input[name="_wpcf7"]').val();
      var unitTag = $(this).find('input[name="_wpcf7_unit_tag"]').val();

      $.getJSON(url, { _wpcf7_is_ajax_call: 1, _wpcf7: id }, function (data) {
        if (data && data.captcha)
          $("#" + unitTag).wpcf7RefillCaptcha(data.captcha);

        if (data && data.quiz) $("#" + unitTag).wpcf7RefillQuiz(data.quiz);
      });
    });
  };

  $.fn.wpcf7RefillCaptcha = function (captcha) {
    return this.each(function () {
      var form = $(this);

      $.each(captcha, function (i, n) {
        form.find(':input[name="' + i + '"]').clearFields();
        form.find("img.wpcf7-captcha-" + i).attr("src", n);
        var match = /([0-9]+)\.(png|gif|jpeg)$/.exec(n);
        form
          .find('input:hidden[name="_wpcf7_captcha_challenge_' + i + '"]')
          .attr("value", match[1]);
      });
    });
  };

  $.fn.wpcf7RefillQuiz = function (quiz) {
    return this.each(function () {
      var form = $(this);

      $.each(quiz, function (i, n) {
        form.find(':input[name="' + i + '"]').clearFields();
        form
          .find(':input[name="' + i + '"]')
          .siblings("span.wpcf7-quiz-label")
          .text(n[0]);
        form
          .find('input:hidden[name="_wpcf7_quiz_answer_' + i + '"]')
          .attr("value", n[1]);
      });
    });
  };

  $.fn.wpcf7ClearResponseOutput = function () {
    return this.each(function () {
      $(this)
        .find("div.wpcf7-response-output")
        .hide()
        .empty()
        .removeClass(
          "wpcf7-mail-sent-ok wpcf7-mail-sent-ng wpcf7-validation-errors wpcf7-spam-blocked"
        );
      $(this).find("span.wpcf7-not-valid-tip").remove();
      $(this).find("img.ajax-loader").css({ visibility: "hidden" });
    });
  };

  $.fn.wpcf7FillResponseOutput = function (message) {
    return this.each(function () {
      $(this)
        .find("div.wpcf7-response-output")
        .append(message)
        .slideDown("fast");
    });
  };

  /* =====================================
             Fancy Box Image viewer
      ====================================== */
  $("[data-fancybox]").fancybox({
    transitionIn: "elastic",
    transitionOut: "elastic",
    speedIn: 600,
    speedOut: 200,
    buttons: [
      "slideShow",
      "fullScreen",
      "thumbs",
      "share",
      // 'download',
      "zoom",
      "close",
    ],
  });

  const audio = document.getElementById("backgroundAudio");
  const playPauseBtn = document.getElementById("playPauseBtn");
  const volumeBtn = document.getElementById("volumeBtn");
  const volumeSlider = document.getElementById("volumeSlider");
  let hasInteracted = false; // Ensure autoplay logic only runs once

  // Function to update play/pause button state
  function updatePlayPauseBtn() {
    if (audio.paused) {
      playPauseBtn.textContent = "▶"; // Play Icon
      playPauseBtn.classList.remove("playing");
    } else {
      playPauseBtn.textContent = "⏸"; // Pause Icon
      playPauseBtn.classList.add("playing");
    }
  }

  // Function to play audio after interaction
  function handleInteraction() {
    if (!hasInteracted) {
      audio
        .play()
        .then(() => {
          updatePlayPauseBtn();
          hasInteracted = true; // Prevent further triggers
          removeInteractivityListeners(); // Remove event listeners
        })
        .catch((err) => {
          console.warn("Autoplay blocked: ", err.message);
        });
    }
  }

  // Play/Pause Button Functionality
  playPauseBtn.addEventListener("click", () => {
    if (audio.paused) {
      audio.play().catch((err) => console.warn("Play failed: ", err.message));
    } else {
      audio.pause();
    }
    updatePlayPauseBtn();
  });

  // Volume Button Toggle
  volumeBtn.addEventListener("click", () => {
    audio.muted = !audio.muted;
    volumeBtn.textContent = audio.muted ? "🔈" : "🔊";
  });

  // Volume Slider Functionality
  volumeSlider.addEventListener("input", (e) => {
    audio.volume = e.target.value;
  });

  // Add event listeners for multiple types of user interactions
  function addInteractivityListeners() {
    document.addEventListener("click", handleInteraction);
    document.addEventListener("mousedown", handleInteraction);
    document.addEventListener("mousemove", handleInteraction);
    document.addEventListener("touchstart", handleInteraction);
    document.addEventListener("scroll", handleInteraction);
    document.addEventListener("keydown", handleInteraction);
  }

  // Remove event listeners after the interaction
  function removeInteractivityListeners() {
    document.removeEventListener("click", handleInteraction);
    document.removeEventListener("mousedown", handleInteraction);
    document.removeEventListener("mousemove", handleInteraction);
    document.removeEventListener("touchstart", handleInteraction);
    document.removeEventListener("scroll", handleInteraction);
    document.removeEventListener("keydown", handleInteraction);
  }

  // Add listeners on page load
  addInteractivityListeners();

  // Ensure correct button state when audio ends
  audio.addEventListener("ended", updatePlayPauseBtn);

  // Ensure correct button state on manual pause/play
  audio.addEventListener("play", updatePlayPauseBtn);
  audio.addEventListener("pause", updatePlayPauseBtn);

  

})(jQuery);
