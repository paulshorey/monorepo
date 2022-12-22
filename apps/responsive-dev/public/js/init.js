;(function () {
  function init() {
    // eapps-form-floating-button eapps-form-floating-button-type-icon eapps-form-floating-button-position-right eapps-form-button eapps-form-floating-button-visible
    // change button appearance
    const elfColor = function () {
      let element = document.querySelector(".eapps-form-floating-button")
      if (element) {
        clearInterval(int_elfColor)
        element.setAttribute("style", "background-color:hsl(38deg 95% 49%)")
      }
    }
    const int_elfColor = setInterval(elfColor, 100)
    // change contact form text
    const elfContactText = function () {
      let element = document.querySelector(".eapps-form-header-text")
      if (element) {
        clearInterval(int_elfContactText)
        element.innerHTML =
          'Thanks a lot for reaching out. I\'m looking forward to chatting. Feel free to contact me directly: <a href="mailto:paul@besta.domains" target="_blank">hello@paulshorey.com</a> or call <a href="mailto:13857706789" target="_blank">+1.385.770.6789</a>'
      }
    }
    const int_elfContactText = setInterval(elfContactText, 100)

    function isElementInView(el) {
      let middle = (window.innerHeight || document.documentElement.clientHeight) * (2 / 5)
      let rect = el.getBoundingClientRect()
      if (rect.top < middle && rect.top + el.clientHeight >= middle) {
        return true
      }
    }

    // setTimeout(function () {
    $(document).ready(function () {
      /*
       * SLIDESHOW
       */
      $(".cycle-slideshow").each(function () {
        $(this).cycle()
        $(this)[0].play = function () {
          try {
            $(this).cycle("resume")
          } catch (e) {}
        }
        $(this)[0].pause = function () {
          try {
            $(this).cycle("pause")
          } catch (e) {}
        }
      })

      /*
       * CLICK ANYWHERE INSIDE DIV TO START/STOP VIDEO
       */
      $("video")
        .parent()
        .click(function () {
          if ($(this).find("video").get(0).paused) {
            $(this).find("video").get(0).play()
            $(this).find(".playpause").fadeOut()
          } else {
            $(this).find("video").get(0).pause()
            $(this).find(".playpause").fadeIn()
          }
        })
    })

    /*
     * VIDEO AUTOPLAY
     */
    $(window).on("load, scroll", function () {
      $("[scrollplay]").each(function () {
        if (isElementInView($(this)[0])) {
          if ($(this)[0].play) {
            $(this)[0].play()
          }
        } else {
          if ($(this)[0].pause) {
            $(this)[0].pause()
          }
        }
      })
    })
  }
  // production
  init()
  // dev
  setTimeout(init, 2000)
})()
