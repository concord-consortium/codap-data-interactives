/*
* Created by evangelineireland on 11/7/16.
*/

$(document).ready(function () {

    //Utility function to check if URL has query param and parse the query param. Returns true if it exists
    function checkQueryParam (){
        var query = decodeURIComponent(window.location.search.substring(1));

        if (query=="dev") {
            return true;
        } else {
            return false;
        }
    }

    function fetchObjList () {
        console.log ("in fetchObjList");
        var loc = "./data_interactive_map.json";
        $.ajax({
            url: loc,
            type: "GET",
            success: buildPage,
            error: function (xhr){
                alert(xhr.status);
            }
        })
    }

    function getCategories (obj){
        console.log("In getCategories");
        var categories_array=[],
            category_objects=[],
            cat_relationship_obj={};

        for (var i=0; i < obj.data_interactives.length; i++) {
            for (var j=0; j < obj.data_interactives[i].categories.length; j++) {
                var category_read = obj.data_interactives[i].categories[j];
                if (!categories_array.includes(category_read) ) {
                    categories_array.push(category_read);
                }
            }
        }
        category_objects = categories_array.map(function (s) {
            var split=s.split('/');
            return {parent:split[0],child:split[1]};
        });

        for (i=0;i<category_objects.length;i++) {
            if (!cat_relationship_obj[category_objects[i].parent]){
                cat_relationship_obj[category_objects[i].parent]=[category_objects[i].child];
            }
            else {
                cat_relationship_obj[category_objects[i].parent].push(category_objects[i].child);
            }
        }
        return (cat_relationship_obj);
    }

    function buildNavBar(categories){
        console.log("In buildNavBar, categories is: " + categories);
        var nav_bar = $(".nav-bar");
        var nav_bar_list = $("<ul>").addClass('menu-h');
        var cat_main_header, cat_sub_header;

        nav_bar_list.appendTo(nav_bar);
        for (var key in categories) {
            if (key.match(' ')){
                cat_main_header = key.replace(/ /g, '_');
            } else {
                cat_main_header=key;
            }

            nav_bar_list.append($('<li>').addClass('main_cat_'+cat_main_header).append($('<a>').attr('href', '#'+cat_main_header+'_header').text(key)));

            var sub_headers = categories[key];
            if(!(sub_headers===undefined)) {
                $('.main_cat_'+cat_main_header).append($('<ul>').addClass('menu-h-dropdown sub_cat_'+cat_main_header));
                sub_headers.forEach(function (el) {
                    if(!(el===undefined)) {
                        if (el.match(' ')) {
                            cat_sub_header = el.replace(/ /g, '_');
                        } else {
                            cat_sub_header = el;
                        }
                        $('.sub_cat_'+cat_main_header).append($('<li>').append($('<a>').attr('href', '#'+cat_sub_header + '_header').text(el)));
                    }
                })
            }

        }
    }

    function buildListingDivs(categories) {
        console.log("In buildListingDivs");
        var cat_list='';
        var cat_main_header='';
        var cat_sub_header='';
        var listing_container = $("#listing_container");
        var home_button = $('<a>').attr('href','#header').addClass('nav-to-top').text('Back to top').append('<img src="./Common/img/home.png" class="home-icon">');


        for (var key in categories) {
            if (key.match(' ')){
                cat_main_header = key.replace(/ /g, '_');
            } else {
                cat_main_header=key;
            }

            var cat_listing_container = $('<div>').addClass('cat_listing_container').addClass(cat_main_header+'_div');
            listing_container.append(cat_listing_container);
            $('.'+cat_main_header+'_div').append($('<h2>').text(key).prop('id',cat_main_header+'_header'));
            $('.'+cat_main_header+'_div').append($('<ul>').prop('id',cat_main_header+'_list'));
            cat_list = $('#'+cat_main_header+'_list');

            var sub_headers = categories[key];
            console.log(sub_headers);
            sub_headers.forEach(function (el) {
                if (!(el===undefined)) {
                    if (el.match(' ')) {
                        cat_sub_header = el.replace(/ /g, '_');
                    } else {
                        cat_sub_header = el;
                    }
                    cat_list.append($('<h3>').text(el).prop('id',cat_sub_header+'_header'));
                    cat_list.append($('<ul>').prop('id', cat_sub_header + '_list'));
                }
            });
        }
        $('.cat_listing_container').append(home_button);
        buildNavBar(categories);

    }

    function AddListingObj(obj) {
        var title = obj.title,
            description = obj.description,
            category = obj.categories,
            path = '',
            url = $("#codap-url").val(),
            category_bin ='',
            listing = '',
            listing_desc ='',
            query_param_di = '?di=',
            launchLink = '',
            linkLink = '',
            url_root = window.location.origin+window.location.pathname;

        if (obj.path.match(/^http/i)) {
            path = obj.path;
        }
        else {
            url_root=url_root.replace(/index.html$/, '');
            path = url_root+obj.path;
        }

        if (url.match(/^https/i) && !path.match(/^https/i)) {
            path=path.replace(/http/i,'https');
        }

        if (path.match(/^https/i) && !url.match(/^https/i)) {
            url=url.replace(/http/i,'https');
        }

            for (var i=0; i<category.length;i++) {
            if (category[i].includes('/')) {
                console.log("In category split");

                var category_split = category[i].split("/");
                if (/ /g.test(category_split[1])){
                    category_split[1] = category_split[1].replace(/ /g, '_');
                }
                category_bin = '#' + category_split[1]+'_list';
            }
            else {
                if (/ /g.test(category[i])){
                    category[i] = category[i].replace(/ /g, '_');
                }
                category_bin = '#' + category[i] + '_list';
            }
            listing = $('<li>').addClass('listing');
            launchLink = $('<a class = "listing-title" target = "_blank" href='+url+query_param_di+path+'> '+title+' </a>'),
                listing_desc = $('<p>').addClass('listing-desc').append(description),
                linkLink = $('<a class = "listing-link" href=' + path + '>Embeddable Link </a>'),
                launchLink.appendTo(listing);
            listing_desc.appendTo(listing);
            linkLink.appendTo(listing);
            listing.appendTo(category_bin);
        }
    }

    function buildListing(listing) {
        console.log("In buildListing")

        $('.listing').remove();
        if (checkQueryParam()) {         //check if url param includes query param
            $("#codap-url").val("https://codap.concord.org/releases/staging/static/dg/en/cert/index.html");
            for (var i=0; i<listing.length; i++) {
                AddListingObj(listing[i]);
            }
        } else {
            for (var i = 0; i < listing.length; i++) {
                if (listing[i].visible) {         //check if item is visible
                    AddListingObj(listing[i]);
                }
            }
        }
    }

    function buildPage(response) {
        var categories_obj = getCategories(response);
        var di_list = response.data_interactives;

        buildListingDivs(categories_obj);
        buildListing(di_list);

      $('#codap_url_form').on('submit', function(event) {
          buildListing(di_list);
          event.preventDefault();
          return false;});
    }

    fetchObjList();
});



