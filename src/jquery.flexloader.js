;(function($) {

	$.fn.flexloader = function(flexslider, options) {

		var Flexloader;

		// constructor
		function Flexloader(domSlider, flexslider, options) {

			// domSlider is the HTML Dom Element of the slider
			// domSlider includes any cloned elements
			// flexslider.slides does not include any cloned elements

			this.flexslider = flexslider;
			this.domSlider = domSlider;
			this.current_slide = 0;
			this.next_slide = 0;
			this.prev_slide = 0;
			this.last_slide = 0;
			this.visible_slides = 0;
			this.offset = 0;
			this.slide_ids = [];
			// get a jquery reference to the slide items (<li>) DOM elements
			// this.$slides = $(this.domSlider).find('.slides li');
			this.$slides = $(this.flexslider.slides);
			this.options = $.extend({
				picturefill: false
			}, options);

			// if the slider.move is defined, set offset to that, otherwise set to 1
			(typeof this.flexslider.move !== 'undefined') ? this.offset = this.flexslider.move : this.offset = 1;

			this.current_slide = this.flexslider.currentSlide;

			this.last_slide = this.flexslider.last;

			// if flexslider.visible is defined, calculate the visible items, otherwise set visible_slides to 0
			// don't forget, flexslider.visible is zero indexed and is the quantity of visible slides
			// so if there are 6 visible slides in the slideshow, flexslider.visible will be 5
			(typeof this.flexslider.visible !== 'undefined') ? this.visible_slides = this.calculate_visible_items() : this.visible_slides = 0;

			// these functions add slides to the slide_ids array
			this.get_current_slides();
			this.get_next_slides();
			this.get_prev_slides();

			this.init();

		}
		// end constructor

		// plugin prototype methods
		Flexloader.prototype = {

			init: function() {

				var _this = this;

				// if this slideshow implements picturefill
				if (this.options.picturefill === true) {

				  // load the slides
				  _this.load_picturefill_slides(this.slide_ids);

				  // load any cloned slides
				  _this.load_picturefill_cloned_slides();

				} else {

				  // load the slides
				  _this.load_slides(this.slide_ids);

				  // load any cloned slides
				  _this.load_cloned_slides();

				}

			},

	    // flexslider does not correctly calculate visible items for a carousel
	    // because does not take into account slider.itemMargin
	    // TODO - figure out why this flexslider code is not working
	    // slider.itemW = (slider.minW > slider.w) ? (slider.w - (slideMargin * (minItems - 1)))/minItems :
	    //                (slider.maxW < slider.w) ? (slider.w - (slideMargin * (maxItems - 1)))/maxItems :
	    //                (slider.vars.itemWidth > slider.w) ? slider.w : slider.vars.itemWidth;
	    //
	    // slider.visible = Math.floor(slider.w/(slider.itemW));
	    // https://github.com/woothemes/FlexSlider/blob/master/jquery.flexslider.js
	    calculate_visible_items: function() {

	      var slider_width,
	          item_width;

	      slider_width = (this.flexslider.viewport===undefined) ? this.flexslider.width() : this.flexslider.viewport.width();
	      item_width = this.flexslider.vars.itemWidth + this.flexslider.vars.itemMargin;

	      return Math.floor(slider_width / item_width);

	    },

	    // GET THE IDS OF SLIDES TO LOAD

	    // get the currently visible slides and add to slide_ids array
	    get_current_slides: function() {

	      var first_visible_slide = this.current_slide * this.offset,
	          last_visible_slide = first_visible_slide + this.visible_slides;

	      for (var i = first_visible_slide; i <= last_visible_slide; i++) {
	        this.slide_ids.push(i);
	      }

	    },
	    // end get the currently visible slides

	    // get the next slides
	    get_next_slides: function() {

	      var current_last_slide = (this.current_slide * this.offset) + this.visible_slides,
	          future_last_slide = current_last_slide + this.offset;

	      // if this is the last slide
	      if (this.current_slide === this.last_slide) {

	        // add the first slide
	        this.slide_ids.push(0);

	      } else {

	        for (var i = future_last_slide; i > current_last_slide; i--) {
	          this.slide_ids.push(i);
	        }

	      }

	    },
	    // end get the next slides

	    // get the prev slides
	    get_prev_slides: function() {

	      // if this is the first slide
	      if (this.current_slide === 0) {

	        // calculate the last slides (or last slide if not a carousel)
	        var adjusted_last_slide = (this.last_slide * this.offset) + this.visible_slides,
	            future_last_slide = adjusted_last_slide + this.offset;

	        // add the last slides
	        for (var i = adjusted_last_slide; i < future_last_slide; i++) {
	          this.slide_ids.push(i);
	        }

	      // if this is any slide except the first slide
	      } else {

		      var current_first_slide = this.current_slide * this.offset,
		          future_first_slide = current_first_slide - this.offset;

	        for (var i = future_first_slide; i < current_first_slide; i++) {
	          this.slide_ids.push(i);
	        }

	      }

	      // // if this is the first slide
	      // if (current_first_slide <= 0) {

	      //   // calculate the last slides
	      //   var adjusted_last_slide = (this.last_slide * this.offset) + this.visible_slides,
	      //       future_last_slide = adjusted_last_slide + this.offset;

	      //       console.log('adjusted_last_slide is ' + adjusted_last_slide);
	      //       console.log('future_first_slide is ' + future_first_slide);

	      //   // add the last slides
	      //   for (var i = future_first_slide; i < current_first_slide; i++) {
	      //     this.slide_ids.push(i);
	      //   }

	      // // if the current slide is any slide except the first slide
	      // } else {

	      //   for (var i = future_first_slide; i < current_first_slide; i++) {
	      //     this.slide_ids.push(i);
	      //   }

	      // }

	    },
	    // end get the prev slides

	    // END GET THE IDS OF SLIDES TO LOAD

	    // NO PICTUREFILL LOAD SLIDES
	    load_slides: function(_slides_ids) {

	    	var _this = this;

	      $(_slides_ids).each(function(index) {

	        var slide_id = _slides_ids[index],
	            current_src,
	            current_data_original,
	            $slide = $(_this.$slides[slide_id]);

	        current_src = $slide.find('img').attr('src');
	        current_data_original = $slide.find('img').attr('data-original');

	        // if there is a data-original attribute and it has not already been loaded into src
	        if ( current_data_original !== 'undefined' && current_src !== current_data_original ) {

	          // update the current slide source
	          $slide.find('img').attr('src', current_data_original);

	        }

	      });
	    },
	    // END NO PICTUREFILL LOAD SLIDES

	    // NO PICTUREFILL LOAD CLONED SLIDES
	    load_cloned_slides: function() {

	      if ( $(this.domSlider).find('.clone').length > 0 ) {

	        // get the cloned slides
	        $(this.domSlider).find('.clone').each(function() {

	          var $clone_slide_image = $(this).find('img'),
	              current_src,
	              current_data_original;

	          // get this slide's picturefill element and get the value of it's first span data-src
	          current_src = $clone_slide_image.attr('src');

	          current_data_original = $clone_slide_image.attr('data-original');

	          // if there is a data-original attribute and it has not already been loaded into src
	          if ( current_data_original !== 'undefined' && current_src !== current_data_original ) {

	            // load data-original into img src
	            $clone_slide_image.attr('src', current_data_original);

	          }

	        });

	      }

	    },
	    // END NO PICTUREFILL LOAD CLONED SLIDES

	    // PICTUREFILL LOAD SLIDES
	    load_picturefill_slides: function(_slides) {

	    	var _this = this;

	      $(_slides).each(function(_slide) {

	        var slide_id = _slides[_slide],
	            picturefill_container,
	            current_data_src,
	            current_data_original,
	            $slide = $(_this.$slides[slide_id]);

	        // get the jquery object for this slide and find an element with attribute data-picture
	        picturefill_container = $(_this.$slides[slide_id]).find('[data-picture]');

	        // get this slide's picturefill element and get the value of it's first span data-src
	        current_data_src = $(picturefill_container).find('span').attr('data-src');

	        current_data_original = $(picturefill_container).find('span').attr('data-original');

	        // if there is a data-original attribute and it has not already been loaded into src
	        if ( current_data_original !== 'undefined' && current_data_src !== current_data_original ) {

	          // get all the children span elements of the picturefill container
	          var $spans = $(picturefill_container).find('span');

	          // for each span in the picturefill container span
	          $.each($spans, function(index, value) {

	            var $span = $($spans[index]),
	                source = $span.attr('data-original');

	            $span.attr('data-src', source);

	            // if this span has a child element img
	            if ($span.find('img').length > 0) {
	              $span.find('img').attr('src', source);
	            }

	          });

	        }

	      });

	    },
	    // END PICTUREFILL LOAD SLIDES

	    // PICTUREFILL LOAD CLONED SLIDES
	    load_picturefill_cloned_slides: function() {

	      if ( $(this.domSlider).find('.clone').length > 0 ) {

	        // get the cloned slides
	        $(this.domSlider).find('.clone').each(function() {

	          var $clone_slide = $(this),
	              picturefill_container,
	              current_data_src,
	              current_data_original;

	          // get the jquery object for this slide and find an element with attribute data-picture
	          picturefill_container = $clone_slide.find('[data-picture]');

	          // get this slide's picturefill element and get the value of it's first span data-src
	          current_data_src = $(picturefill_container).find('span').attr('data-src');

	          current_data_original = $(picturefill_container).find('span').attr('data-original');

	          // if there is a data-original attribute and it has not already been loaded into src
	          if ( current_data_original !== 'undefined' && current_data_src !== current_data_original ) {

	            // get all the children span elements of the picturefill container
	            var $spans = $(picturefill_container).find('span');

	            // for each span in the picturefill container span
	            $.each($spans, function(index, value) {

	              var $span = $($spans[index]),
	                  source = $span.attr('data-original');

	              $span.attr('data-src', source);

	              // if this span has a child element img
	              if ($span.find('img').length > 0) {
	                $span.find('img').attr('src', source);
	              }

	            });

	          }

	        });

	      }

	    }
	    // END PICTUREFILL LOAD CLONED SLIDES

		};
		// end plugin prototype methods

    return this.each(function() {

    	new Flexloader(this, flexslider, options);

      // if ( !$.data( this, "plugin_flexloader" ) ) {
      //   console.log('IF HAPPENED');
      //   $.data( this, "plugin_flexloader", new Flexloader(this, options) );
      // } else {
      //   console.log('ELSE HAPPENED');
      // }

    });

  };

}(jQuery));

