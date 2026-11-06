import $ from "jquery.min.js"
      $(document).ready(function() {
      
      // Monitor page scroll depth
      $(window).on('scroll', function() {
        if ($(this).scrollTop() > 300) {
          $('#backToTop').fadeIn(200); // Reveal button
        } else {
          $('#backToTop').fadeOut(200); // Hide button
        }
      });

      // Handle button click action
      $('#backToTop').on('click', function() {
        // Animate html/body scroll position smoothly back to zero
        $('html, body').animate({ scrollTop: 0 }, 500);
      });

    });
  
