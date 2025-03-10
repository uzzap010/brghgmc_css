from django import template

register = template.Library()

@register.filter
def get_field(form, field_name):
    """
    Returns the field from the form with the given name.
    Used for dynamic field access in templates.
    """
    try:
        return form[field_name]
    except KeyError:
        return None

@register.filter
def add_class(field, css_class):
    """
    Adds CSS classes to the form field.
    """
    return field.as_widget(attrs={'class': css_class})

@register.filter
def add(value, arg):
    """
    Concatenates the argument to the value.
    Used for building field names dynamically.
    """
    return str(value) + str(arg)

@register.filter
def split(value, delimiter=','):
    """
    Splits a string into a list using the specified delimiter.
    """
    return value.split(delimiter) 