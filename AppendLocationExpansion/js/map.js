$(document).ready(function () {
    var map = L.map('map').setView([10.669644, 122.948844], 17);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
    var tempMarker = null;
    
    function clearForm() {
        $("#lat").val('');
        $("#lng").val('');
        $("#category").val('');
        $("#names").val('');
        $("#descriptions").val('');
    }

    var customControl = L.control({ position: 'topright' });
    customControl.onAdd = function () {
        var div = L.DomUtil.create('div', 'leaflet-bar leaflet-control');
        L.DomEvent.disableClickPropagation(div);

        var resetBtn = L.DomUtil.create('button', '', div);
        resetBtn.innerHTML = "Reset Zoom";
        resetBtn.style.display = "block";
        resetBtn.style.width = "100%";
        resetBtn.onclick = function (e) {
            L.DomEvent.stopPropagation(e); 
            map.setView([10.669644, 122.948844], 17);
        };

        // Plot Button
        var plotBtn = L.DomUtil.create('button', '', div);
        plotBtn.innerHTML = "Plot";
        plotBtn.style.display = "block";
        plotBtn.style.width = "100%";

        plotBtn.onclick = function (e) {
            L.DomEvent.stopPropagation(e); 
            clearForm(); 
            $("#plotForm").show();

            
        };

        //Post Button
        var postBtn = L.DomUtil.create('button', '', div);
        postBtn.innerHTML = "Post";
        postBtn.style.display = "block";
        postBtn.style.width = "100%";

        postBtn.onclick = function (e) {
            L.DomEvent.stopPropagation(e); 
            clearForm(); 
            $("#plotForm").hide();

            if(tempMarker) {
                map.removeLayer(tempMarker);
                tempMarker = null;
            }
        
        };
        
        // Clear Button
        var clearBtn = L.DomUtil.create('button', '', div);
        clearBtn.innerHTML = "Clear";
        clearBtn.style.display = "block";
        clearBtn.style.width = "100%";
        
        clearBtn.onclick = function (e) {
            L.DomEvent.stopPropagation(e);
            clearForm();
            map.setView([10.669644, 122.948844], 17);
            $("#plotForm").hide();

            if (tempMarker) {
                map.clearForm(tempMarker);
                tempMarker = null;
            }
        
        };
        return div;

    };

    customControl.addTo(map);

    $("#newBtn").click(function (e) {
        e.stopPropagation();
        clearForm();

        if (tempMarker) {
            map.removeLayer(tempMarker);
            tempMarker = null;
        }
    });

    $("#closeForm").click(function (e) {
        e.stopPropagation();
        $("#plotForm").hide();

        if (tempMarker) {
            map.removeLayer(tempMarker);
            tempMarker = null;
        }
    });

    map.on("movestart", function () {
        if ($("#plotForm").is(":visible")) {
            if (tempMarker) {
                map.removeLayer(tempMarker);
                tempMarker = null;
            }
            $("#plotForm").hide();
        }
    });
        

    map.on("click", function (e) {
        if ($(e.originalEvent.target).closest("#plotForm, .leaflet-control").length > 0) {
            return;
        }

        var lat = e.latlng.lat.toFixed(6);
        var lng = e.latlng.lng.toFixed(6);

        if (tempMarker) {
            map.removeLayer(tempMarker);
        }

        tempMarker = L.marker([lat, lng]).addTo(map);

        clearForm();
        $("#plotForm").show();
        $("#lat").val(lat);
        $("#lng").val(lng);
    });


    $("#saveBtn").click(function (e) {
        e.stopPropagation();
        var lat = parseFloat($("#lat").val());
        var lng = parseFloat($("#lng").val());
        var category = $("#category").val();
        var names = $("#names").val();
        var descriptions = $("#descriptions").val();

        if (!isNaN(lat) && !isNaN(lng) && category !== "") {
            $.ajax({
                url: "forms/save_location.php",
                type: "POST",
                data: {
                    latitude: lat,
                    longitude: lng,
                    category: category,
                    names: names,
                    descriptions: descriptions
                },

                success: function (response) {
                    var res = JSON.parse(response);

                    if (res.status === "success") {
                        if (tempMarker) {
                            map.removeLayer(tempMarker);
                            tempMarker = null;  
                        }

                        let category = $("#category").val();
                        let iconpath = '';
                        if (category === 'Restaurant'){
                            iconpath = 'assets/images/restaurant.png';
                        }else if (category === 'Church'){
                            iconpath = 'assets/images/church.png';
                        }else if (category === 'Mall'){
                            iconpath = 'assets/images/mall.png';
                        }else if (category === 'School'){
                            iconpath = 'assets/images/school.png';
                        }else{
                            iconpath = 'assets/images/park.png';
                        }

                        var customIcon = L.icon({
                            iconUrl: iconpath,
                            iconSize: [50, 50],
                            iconAnchor: [25, 50],
                            popupAnchor: [0, -50]
                        });

                        L.marker([lat, lng], { icon: customIcon })
                            .addTo(map) 
                            .bindPopup("<b>" + category + "</b><br><b>" + names + "</b><br>" + descriptions)
                            .openPopup();  

                        $("#plotForm").hide();
                        Swal.fire("Saved successfully!");
                    } else {
                        Swal.fire(res.message);
                    }
                },
                error: function () {
                    Swal.fire("Error connecting to server.");
                }
            });
        } else {
            Swal.fire("Please enter valid latitude, longitude, and category.");
        }

      
    });
});