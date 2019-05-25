(function (module) {
    "use strict";
    module.directive("fileUpload", fileUploadDirective);
    fileUploadDirective.$inject = ["orderService", "Alertify"];
    function fileUploadDirective(orderService) {
        var directive = {
            restrict: "E",
            scope: {
                onChange: "&"
            },
            link: link,
            templateUrl: "app/directives/file.upload.html"
        };

        return directive;

        function link(scope, element, attr) {
            element.bind("change", function (changeEvent) {
                var file = changeEvent.target.files[0];
                setPercentProgressBar(0);
                compress(changeEvent)
                    .then(compressedFile => getBase64(compressedFile))
                    .then(data => {
                        var formData = new FormData();
                        scope.$apply(function () { scope.showProgressBar = true });

                        formData.append("file", file, file.name);
                        formData.append("action", "upload");
                        formData.append("timestamp", new Date().getTime());
                        formData.append("key", "3239060aa720f271bd2f43bbf0618409");
                        formData.append("name", file.name);
                        formData.append("image", data);

                        $.ajax({
                            type: "POST",
                            url: "https://api.imgbb.com/1/upload?key=" + "3239060aa720f271bd2f43bbf0618409",
                            headers: {
                                "accept": "application/json"
                            },
                            xhr: function () {
                                var myXhr = $.ajaxSettings.xhr();
                                if (myXhr.upload) {
                                    myXhr.upload.addEventListener('progress', progressHandling, false);
                                }
                                return myXhr;
                            },
                            success: function (response) {
                                if (response.success) {
                                    var imgSrc = response.data.image.url;
                                    scope.$apply(function () {
                                        scope.onChange({ imgSrc: imgSrc });
                                    });
                                }

                            },
                            error: function (error) {
                                // handle error
                            },
                            async: true,
                            data: formData,
                            cache: false,
                            contentType: false,
                            processData: false,
                            timeout: 60000
                        });

                    });


                function setPercentProgressBar(percent) {
                    var progress_bar_id = "#progressbar";
                    var bars = $(element).find("#progressbar");
                    if (bars) {
                        $(bars[0]).css("width", +percent + "%");
                    }
                }


                function progressHandling(event) {
                    var percent = 0;
                    var position = event.loaded || event.position;
                    var total = event.total;
                    if (event.lengthComputable) {
                        percent = Math.ceil(position / total * 100);
                    }
                    setPercentProgressBar(percent);
                };

                function getBase64(file) {
                    return new Promise((resolve, reject) => {
                        const reader = new FileReader();
                        reader.readAsDataURL(file);
                        reader.onload = () => {
                            let encoded = reader.result.replace(/^data:(.*;base64,)?/, '');
                            if ((encoded.length % 4) > 0) {
                                encoded += '='.repeat(4 - (encoded.length % 4));
                            }
                            resolve(encoded);
                        };
                        reader.onerror = error => reject(error);
                    });
                }

                function compress(e) {
                    return new Promise((resolve, reject) => {
                        const width = 750;
                        const height = 450;
                        const fileName = e.target.files[0].name;
                        const reader = new FileReader();
                        reader.readAsDataURL(e.target.files[0]);
                        reader.onload = event => {
                            const img = new Image();
                            img.src = event.target.result;
                            img.onload = () => {
                                const elem = document.createElement('canvas');
                                elem.width = width;
                                elem.height = height;
                                const ctx = elem.getContext('2d');
                                // img.width and img.height will contain the original dimensions
                                ctx.drawImage(img, 0, 0, width, height);
                                ctx.canvas.toBlob((blob) => {
                                    const file = new File([blob], fileName, {
                                        type: 'image/jpeg',
                                        lastModified: Date.now()
                                    });
                                    resolve(file);
                                }, 'image/jpeg', 1);
                            },
                                reader.onerror = error => {
                                    reject(error);
                                    console.log(error);

                                }
                        };
                    });

                }
            });
        }
    }
}
)(angular.module("myApp"));