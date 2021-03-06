$(function () {
    // --------------------------------------------------------------------------------------------
    // Initialisierung der CSS-Komponenten
    // --------------------------------------------------------------------------------------------
    M.AutoInit();
    $('.modal').modal({
        onCloseEnd: function () {
            $('#carForm').attr('current-record', 'none');
            console.log('test');
        }
    });


    $('#msg-btn').on('click', function () {
        M.toast({
            html: 'Message sent'
        });
        $('.colordiv').addClass('grey');
    });

    $('.date-year').html(`© ${new Date().getFullYear()} Maurice Oegerli`);

    $('.colorpicker-custom').on('change', function () {
        $('.colorpicker-custom-btn').css('background-color', $('.colorpicker-custom').val());
        $('.custom-label-input').val($('.colorpicker-custom').val());
        $('.custom-label').addClass('active');
    });

    // --------------------------------------------------------------------------------------------
    // Autos werden geladen
    // --------------------------------------------------------------------------------------------
    $.ajax({
        type: "GET",
        url: "autos.php",
        data: {
            action: 'getdata'
        },
        dataType: "json",
        success: function (data) {
            autoLaden(data);
        },
        error: function (data) {
            var response = data.responseJSON;
            response.forEach(element => {
                M.toast({
                    html: `Fehler bei ${element}`
                })
            });
        }
    });

    // --------------------------------------------------------------------------------------------
    // Funktion fürs (Neu) laden
    // --------------------------------------------------------------------------------------------
    function autoLaden(autos) {
        $('.auto-list').html($('#auto_liste_template'));
        $('#auto_liste_template').show();
        autos.forEach(element => {
            var template = $('#auto_liste_template').outerHTML();

            var datensatz = Mustache.to_html(template, element);
            $(datensatz).appendTo('.auto-list').prop('id', `auto_liste_${element.id}`);
            $(`#auto_liste_${element.id}`).find('.name>i').css('color', element.farbe);
        });

        $('#auto_liste_template').hide();

        $('.fuel-btn').on('click', function () {
            var id = $(this).parent().attr('data-id');
            var tankfuellung = parseInt($(`#auto_liste_${id}`).find('.tank').html());
            $(`#auto_liste_${id}`).find('.tank').html(tankfuellung + 1);

            $.ajax({
                type: 'POST',
                url: "autos.php",
                data: {
                    action: 'tankfuellung',
                    id: id,
                    tank: tankfuellung + 1,
                },
                dataType: 'json',
                success: function (data) {
                    autoLaden(data);

                    M.toast({
                        html: 'Betankt'
                    });
                },
                error: function (data) {
                    var response = data.responseJSON;
                    response.forEach(element => {
                        M.toast({
                            html: `Fehler bei ${element}`
                        })
                    });
                }
            });

        });

        // --------------------------------------------------------------------------------------------
        // Bearbeiten eines Autos
        // --------------------------------------------------------------------------------------------
        $('.edit-btn').on('click', function () {
            var id = $(this).parent().attr('data-id');
            $('#carForm').attr('current-record', id);
            var modal = M.Modal.getInstance($('#modal'));

            var autoListe = $(`#auto_liste_${id}`);

            $('#name').siblings('label').addClass('active');
            $('#kraftstoff').siblings('label').addClass('active');
            $('#bauart').siblings('label').addClass('active');
            $('#colorfield').siblings('label').addClass('active');

            $('#name').val(autoListe.find('.name').text());
            $('#kraftstoff').val(autoListe.find('.kraftstoff').html());
            $('#bauart').val(autoListe.find('.bauart').html());
            $('#colorfield').val(autoListe.find('.farbe').html());

            $('select').formSelect();

            modal.open();
        });

        // --------------------------------------------------------------------------------------------
        // Löschen eines Autos
        // --------------------------------------------------------------------------------------------
        $('.delete-btn').on('click', function () {
            var id = $(this).parent().attr('data-id');
            $.ajax({
                type: "DELETE",
                url: "autos.php",
                data: {
                    action: 'deletedata',
                    id: id,
                },
                dataType: 'json',
                success: function (data) {
                    autoLaden(data);
                },
                error: function (data) {
                    var response = data.responseJSON;
                    response.forEach(element => {
                        M.toast({
                            html: `Fehler bei ${element}`
                        })
                    });
                }
            });

            M.toast({
                html: 'Gelöscht'
            });
        });
    }

    // --------------------------------------------------------------------------------------------
    // Formular absenden
    // --------------------------------------------------------------------------------------------
    $('#carForm').submit(function (e) {
        var name = $('#name').val();
        var kraftstoff = $('#kraftstoff').val();
        var bauart = $('#bauart').val();
        var farbe = $('#colorfield').val();
        var id = $('#carForm').attr('current-record');

        if (id == 'none') {
            $.ajax({
                type: 'POST',
                url: "autos.php",
                data: {
                    action: 'postdata',
                    name: name,
                    kraftstoff: kraftstoff,
                    bauart: bauart,
                    farbe: farbe
                },
                dataType: 'json',
                success: function (data) {
                    autoLaden(data);
                    $('#reset').click();
                    M.Modal.getInstance($('#modal')).close();
                },
                error: function (data) {
                    var response = data.responseJSON;
                    response.forEach(element => {
                        M.toast({
                            html: `Fehler bei ${element}`
                        });
                        $(`#${element}`).addClass('invalid');
                    });
                }
            });
        } else {
            $.ajax({
                type: 'PUT',
                url: "autos.php",
                data: {
                    action: 'putdata',
                    id: id,
                    name: name,
                    kraftstoff: kraftstoff,
                    bauart: bauart,
                    farbe: farbe
                },
                dataType: 'json',
                success: function (data) {
                    autoLaden(data);
                    $('#reset').click();
                    M.Modal.getInstance($('#modal')).close();
                },
                error: function (data) {
                    var response = data.responseJSON;
                    response.forEach(element => {
                        M.toast({
                            html: `Fehler bei ${element}`
                        });
                        $(`#${element}`).addClass('invalid');
                    });
                }
            });
        }

        e.preventDefault();
    });
});

jQuery.fn.extend({
    outerHTML: function () {
        return jQuery('<div />').append(this.eq(0).clone()).html();
    }
});