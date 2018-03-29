$(document).ready(function()
{
    $('[name*=tree]').each(function()
    {
        if($(this).val() == 'browse') $(this).parent('label').css('width', '');
    });
    $('[name*=setting]').each(function()
    {
        if($(this).val() == 'lang') $(this).parent('label').css('width', '');
    });
    $('[name*=report]').each(function()
    {
        if($(this).val() == 'browse') $(this).parent('label').css('width', '');
    });
})
