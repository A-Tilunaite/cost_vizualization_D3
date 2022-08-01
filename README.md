# cost-vizualization
Learn D3 using cost of living data from https://www.numbeo.com/cost-of-living/

# Data, icons

Data is mostly from European Union countries (with UK, Australia and New Zealand added for comparison) scraped on 2022-05. It is saved as csv file and manually adjusted as json for tree map visualization.

Icons used for visualization are drawn using Inkscape and saved as svg files.

# Tasks

1. Visualize mean salary of specified countries (in euros). Range of salaries is mapped from 1 to 10 coins for visualization, while precise salary is mentioned below (Currency was converted based on 2022-05-21 transfer rates).

Attempt is in "Coins_mean_salary" folder. 
![Coins_mean_salary output](./Images/Average_net_salary.png "Output of code from 'Coins_mean_salary' folder")

2. Visualize prices of specified groceries (in euros). Images of items are scaled based on the price, while the sum of all shown items is mentioned below. Legend indicates relationship between images size and item prices (Currency was converted based on 2022-05-21 transfer rates).

Attempt is in "Scaled_groceries" folder. 
![Scaled_groceries output](./Images/some_groceries_illustration.png "Output of code from 'Scaled_groceries' folder")