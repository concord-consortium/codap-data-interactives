# Choosy

## attributes tab

Use the little sliders hide or show attributes. Green means visible.
This is the same as choosing hide or show attribute from the attribute's menu in CODAP...
except that you can show single attributes instead of showing "all hidden."

### batches
You can also group attributes into "batches."
For example, in a dataset about people, 
you might have five different attributes about work and income;
you can group them together by putting them in a batch.

You can expand and collapse batchs using the disclosure triangles. 
You can also make the whole group visible or invisible in CODAP using visibiity "eyes."

You can move an attribute to a different batch: 
drag its name to the **gray title bar** of the batch you want.

To make a new batch (suppose it's going to be called `work`), 
type "work" into the **New batch name** text box in the **attributes** tab. 
When you press enter or tab, a new (empty) batch appears at the bottom.


### levels
Instead of using batches to group attributes, you can use their position in the hierarchy.
Choose this mode by picking **level** instead of **batch** at the top of the **attributes** tab.

You can't drag attributes to different levels in `choosy`. 
But of course you can drag them wherever you want in CODAP itself!

## tag cases tab

You can "tag" cases with labels that you type into the boxes.

The basic idea is to select the cases in CODAP, then tag them in `choosy`. There are three modes for tagging:

* **simple**: You tag the selection with the string in the box.
* **binary**: You tag the selection with the string in the first box, and also tag everything that is *not* selected with the string in the second box.
Use this to divide the dataset into two complementary groups, e.g., `tall` and `short` or `$` and `$$`.
* **random**: Enter the proportion of cases that will be in "group A" and give labels to group A and group B. 
Enter this proportion as a percentage (e.g., `20%`), a fraction (`1/5`) or a decimal (`0.2`).
  You could use this feature to create a training set.

The name of the attribute for the tags is...`Tag`. 
But you can change that in the box at the bottom of that panel.

A note: some people are tempted to use tagging to do all of their recoding. 
Remember that there might be good ways to do that directly in CODAP,
and that if you _can_ express what you want in a formula,
it will update correctly if you add more data to your dataset.

## Credits!

* The **visibility** and **hidden** eyeball icons are from [Pixel Perfect](https://www.flaticon.com/authors/pixel-perfect) at [www.flaticon.com](https://www.flaticon.com/)
* We made the sliders ourselves.