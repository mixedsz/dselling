$(function() {

    const totalDots = 15;

    function createDots() {
        const rankBar = $('#rank-bar');
        rankBar.empty();
        for (let i = 0; i < totalDots; i++) {
            rankBar.append('<div class="rank-dot"></div>');
        }
    }

    createDots();

    let animationTimeouts = [];
    let notificationTimeouts = [];

    // Only cancels the rank-bar animation timers — never touches custom-notif
    // or level-up notification timers, so those always auto-hide correctly.
    function clearAllTimeouts() {
        animationTimeouts.forEach(id => window.clearTimeout(id));
        animationTimeouts = [];
    }

    function clearNotificationTimeouts() {
        notificationTimeouts.forEach(id => window.clearTimeout(id));
        notificationTimeouts = [];
    }

    function safeTimeout(callback, delay) {
        const id = setTimeout(callback, delay);
        animationTimeouts.push(id);
        return id;
    }

    function safeNotificationTimeout(callback, delay) {
        const id = setTimeout(callback, delay);
        notificationTimeouts.push(id);
        return id;
    }

    // Animate progress percentage counter
    function animateProgressPercentage(targetPercent, duration = 1000) {
        const startPercent = parseInt($('#progress-text').text()) || 0;
        const startTime = Date.now();

        function updatePercentage() {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            const currentPercent = Math.round(startPercent + (targetPercent - startPercent) * easeOutQuart);
            $('#progress-text').text(currentPercent + '%');
            if (progress < 1) {
                requestAnimationFrame(updatePercentage);
            }
        }

        requestAnimationFrame(updatePercentage);
    }

    function updateDots(progressPercent, addedPoints, previousProgress, isLevelUp, oldRank, newRank, oldRankName, newRankName) {
        const dots = $('.rank-dot');
        const filledDots = Math.round((progressPercent / 100) * totalDots);

        clearAllTimeouts();

        animateProgressPercentage(progressPercent);

        if (isLevelUp && oldRank && newRank) {

            $('#rank-name').text(oldRankName);
            $('#current-rank').text(oldRank);
            $('#next-rank').text(parseInt(oldRank) + 1);

            const previousFilledDots = Math.round((previousProgress / 100) * totalDots);

            dots.each(function() {
                $(this).removeClass('filled');
            });

            for (let i = 0; i < previousFilledDots; i++) {
                $(dots[i]).addClass('filled');
            }

            let animationDelay = 500;

            animateProgressPercentage(100, 800);

            for (let i = previousFilledDots; i < totalDots; i++) {
                safeTimeout(function() {
                    $(dots[i]).addClass('filled');

                    if (i === totalDots - 1) {
                        safeTimeout(function() {
                            $('#rank-name').addClass('rank-name-change');
                            $('#current-rank').addClass('rank-change');
                            $('#next-rank').addClass('rank-change');

                            safeTimeout(function() {
                                $('#rank-name').text(newRankName);
                                $('#current-rank').text(newRank);
                                $('#next-rank').text(parseInt(newRank) + 1);

                                safeTimeout(function() {
                                    $('#rank-name').removeClass('rank-name-change');
                                    $('#current-rank').removeClass('rank-change');
                                    $('#next-rank').removeClass('rank-change');

                                    dots.each(function() {
                                        $(this).removeClass('filled');
                                    });

                                    safeTimeout(function() {
                                        animateProgressPercentage(progressPercent, 600);
                                        for (let j = 0; j < filledDots; j++) {
                                            safeTimeout(function() {
                                                $(dots[j]).addClass('filled');
                                            }, j * 50);
                                        }
                                    }, 300);
                                }, 1000);
                            }, 1000);
                        }, 500);
                    }
                }, animationDelay + (i - previousFilledDots) * 100);
            }

        } else if (addedPoints && addedPoints > 0 && previousProgress !== undefined) {
            const previousFilledDots = Math.round((previousProgress / 100) * totalDots);

            for (let i = previousFilledDots; i < totalDots; i++) {
                $(dots[i]).removeClass('filled');
            }
            for (let i = 0; i < previousFilledDots; i++) {
                $(dots[i]).addClass('filled');
            }

            let animationDelay = 100;

            for (let i = previousFilledDots; i < filledDots; i++) {
                safeTimeout(function() {
                    $(dots[i]).addClass('filled');
                }, animationDelay + (i - previousFilledDots) * 100);
            }

        } else {
            dots.each(function(index) {
                if (index < filledDots) {
                    $(this).addClass('filled');
                } else {
                    $(this).removeClass('filled');
                }
            });
        }
    }

    function showLevelUpNotification(level, type) {
        clearNotificationTimeouts();

        $('#level-number').text(level);

        if (type === 'car') {
            $('#unlock-type').text('New Car');
            $('#reward-image').removeClass('rewards-silhouette').addClass('car-silhouette');
        } else if (type === 'item') {
            $('#unlock-type').text('New Item');
            $('#reward-image').removeClass('car-silhouette').addClass('rewards-silhouette');
        } else {
            $('#unlock-type').text('New Reward');
            $('#reward-image').removeClass('car-silhouette').addClass('rewards-silhouette');
        }

        $('#unlock-text').text('Unlocked');
        $('#level-up-notification').css('display', 'block');
        $('#level-up-notification').addClass('level-fade-in');

        safeNotificationTimeout(() => {
            $('#level-up-notification').addClass('level-fade-out');

            safeNotificationTimeout(() => {
                $('#level-up-notification').removeClass('level-fade-in level-fade-out');
                $('#level-up-notification').css('display', 'none');
            }, 500);
        }, 5000);
    }

    window.addEventListener('message', function(event) {
        const data = event.data;

        if (data.action === 'showRankBar') {
            $('#rank-name').text(data.rankName);
            $('#current-rank').text(data.currentRank);
            $('#next-rank').text(data.nextRank);

            $('#rank-progress-container').addClass('fade-in');
            $('#rank-progress-container').css('display', 'flex');

            safeTimeout(() => {
                updateDots(
                    data.progress,
                    data.addedPoints,
                    data.previousProgress,
                    data.isLevelUp,
                    data.oldRank,
                    data.newRank,
                    data.oldRankName,
                    data.rankName
                );
            }, 100);

        } else if (data.action === 'hideRankBar') {
            $('#rank-progress-container').addClass('fade-out');

            safeTimeout(() => {
                $('#rank-progress-container').removeClass('fade-in fade-out');
                $('#rank-progress-container').css('display', 'none');
                clearAllTimeouts();
                $('.rank-dot').removeClass('filled');
            }, 300);

        } else if (data.action === 'showLevelUp') {
            showLevelUpNotification(data.level, data.type);

        } else if (data.action === 'updateHeat') {
            const tierColors = ['#6ec6ff', '#fff59d', '#ff8a65', '#ef5350', '#b71c1c'];
            const color = tierColors[(data.tier || 1) - 1] || tierColors[0];
            if (data.heat > 0) {
                $('#heat-indicator').css('display', 'flex');
                $('#heat-bar-fill').css({ 'width': data.heat + '%', 'background-color': color });
                $('#heat-icon').css('color', color);
                $('#heat-tier-label').text(data.label || 'COLD').css('color', color);
            } else {
                $('#heat-indicator').css('display', 'none');
            }

        } else if (data.action === 'showHeatIndicator') {
            if (parseInt($('#heat-bar-fill').css('width')) > 0) {
                $('#heat-indicator').css('display', 'flex');
            }

        } else if (data.action === 'hideHeatIndicator') {
            $('#heat-indicator').css('display', 'none');
        }
    });

});
