
from flask import jsonify, request, session, make_response
from models import db, Order, OrderItem, Product, User, SellerProfile
from datetime import datetime, timedelta
import csv
import io
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
import json

def generate_reports(days=30):
    """Generate comprehensive reports for the admin dashboard"""
    try:
        # Calculate date range
        end_date = datetime.utcnow()
        start_date = end_date - timedelta(days=days)
        
        # Sales Report
        sales_report = generate_sales_report(start_date, end_date)
        
        # Orders Report
        orders_report = generate_orders_report(start_date, end_date)
        
        # Products Report
        products_report = generate_products_report()
        
        # Users Report
        users_report = generate_users_report(start_date, end_date)
        
        # Revenue Report
        revenue_report = generate_revenue_report(start_date, end_date)
        
        return jsonify({
            'success': True,
            'reports': {
                'salesReport': sales_report,
                'ordersReport': orders_report,
                'productsReport': products_report,
                'usersReport': users_report,
                'revenueReport': revenue_report
            }
        }), 200
        
    except Exception as e:
        print(f"Error generating reports: {str(e)}")
        return jsonify({'success': False, 'message': f'Error generating reports: {str(e)}'}), 500

def generate_sales_report(start_date, end_date):
    """Generate sales performance report"""
    orders = db.session.query(Order).filter(
        Order.created_at >= start_date,
        Order.created_at <= end_date
    ).all()
    
    total_sales = len(orders)
    completed_sales = len([o for o in orders if o.status == 'Delivered'])
    pending_sales = len([o for o in orders if o.status in ['Pending', 'Processing']])
    
    # Sales by status
    status_breakdown = {}
    for order in orders:
        status_breakdown[order.status] = status_breakdown.get(order.status, 0) + 1
    
    return {
        'totalSales': total_sales,
        'completedSales': completed_sales,
        'pendingSales': pending_sales,
        'statusBreakdown': status_breakdown,
        'period': f"{start_date.strftime('%Y-%m-%d')} to {end_date.strftime('%Y-%m-%d')}"
    }

def generate_orders_report(start_date, end_date):
    """Generate detailed orders report"""
    orders = db.session.query(Order).filter(
        Order.created_at >= start_date,
        Order.created_at <= end_date
    ).all()
    
    total_orders = len(orders)
    total_value = sum(float(order.total) for order in orders)
    average_order_value = total_value / total_orders if total_orders > 0 else 0
    
    # Orders by day
    daily_orders = {}
    for order in orders:
        day = order.created_at.strftime('%Y-%m-%d')
        daily_orders[day] = daily_orders.get(day, 0) + 1
    
    return {
        'totalOrders': total_orders,
        'totalValue': total_value,
        'averageOrderValue': round(average_order_value, 2),
        'dailyOrders': daily_orders,
        'period': f"{start_date.strftime('%Y-%m-%d')} to {end_date.strftime('%Y-%m-%d')}"
    }

def generate_products_report():
    """Generate products performance report"""
    products = db.session.query(Product).all()
    
    # Get order items to calculate sales
    order_items = db.session.query(OrderItem).all()
    
    product_sales = {}
    for item in order_items:
        product_id = item.product_id
        product_sales[product_id] = product_sales.get(product_id, 0) + item.quantity
    
    # Category breakdown
    category_count = {}
    category_sales = {}
    for product in products:
        category = product.category
        category_count[category] = category_count.get(category, 0) + 1
        
        sales = product_sales.get(product.product_id, 0)
        category_sales[category] = category_sales.get(category, 0) + sales
    
    # Top selling products
    top_products = []
    for product in products:
        sales = product_sales.get(product.product_id, 0)
        top_products.append({
            'name': product.name,
            'sales': sales,
            'stock': product.stock,
            'price': float(product.price)
        })
    
    top_products.sort(key=lambda x: x['sales'], reverse=True)
    
    return {
        'totalProducts': len(products),
        'categoryBreakdown': category_count,
        'categorySales': category_sales,
        'topProducts': top_products[:10],
        'lowStockProducts': [p for p in products if p.stock < 10]
    }

def generate_users_report(start_date, end_date):
    """Generate users activity report"""
    # New users in period
    new_users = db.session.query(User).filter(
        User.created_at >= start_date,
        User.created_at <= end_date
    ).all()
    
    # New sellers in period
    new_sellers = db.session.query(SellerProfile).filter(
        SellerProfile.created_at >= start_date,
        SellerProfile.created_at <= end_date
    ).all()
    
    # Total users and sellers
    total_users = db.session.query(User).count()
    total_sellers = db.session.query(SellerProfile).count()
    
    # Seller approval status
    seller_status = {}
    all_sellers = db.session.query(SellerProfile).all()
    for seller in all_sellers:
        status = seller.approval_status
        seller_status[status] = seller_status.get(status, 0) + 1
    
    return {
        'totalUsers': total_users,
        'totalSellers': total_sellers,
        'newUsers': len(new_users),
        'newSellers': len(new_sellers),
        'sellerStatusBreakdown': seller_status,
        'period': f"{start_date.strftime('%Y-%m-%d')} to {end_date.strftime('%Y-%m-%d')}"
    }

def generate_revenue_report(start_date, end_date):
    """Generate revenue analysis report"""
    orders = db.session.query(Order).filter(
        Order.created_at >= start_date,
        Order.created_at <= end_date,
        Order.status.in_(['Delivered', 'Processing', 'Dispatched'])
    ).all()
    
    total_revenue = sum(float(order.total) for order in orders)
    
    # Revenue by day
    daily_revenue = {}
    for order in orders:
        day = order.created_at.strftime('%Y-%m-%d')
        daily_revenue[day] = daily_revenue.get(day, 0) + float(order.total)
    
    # Revenue by month (if date range > 30 days)
    monthly_revenue = {}
    for order in orders:
        month = order.created_at.strftime('%Y-%m')
        monthly_revenue[month] = monthly_revenue.get(month, 0) + float(order.total)
    
    return {
        'totalRevenue': round(total_revenue, 2),
        'dailyRevenue': daily_revenue,
        'monthlyRevenue': monthly_revenue,
        'averageDailyRevenue': round(total_revenue / max(1, (end_date - start_date).days), 2),
        'period': f"{start_date.strftime('%Y-%m-%d')} to {end_date.strftime('%Y-%m-%d')}"
    }

def download_report():
    """Generate and download reports in PDF or CSV format"""
    try:
        data = request.get_json()
        report_type = data.get('reportType')
        format_type = data.get('format', 'pdf')
        days = data.get('dateRange', 30)
        
        # Calculate date range
        end_date = datetime.utcnow()
        start_date = end_date - timedelta(days=days)
        
        # Generate report data based on type
        if report_type == 'sales':
            report_data = generate_sales_report(start_date, end_date)
        elif report_type == 'orders':
            report_data = generate_orders_report(start_date, end_date)
        elif report_type == 'products':
            report_data = generate_products_report()
        elif report_type == 'users':
            report_data = generate_users_report(start_date, end_date)
        elif report_type == 'revenue':
            report_data = generate_revenue_report(start_date, end_date)
        else:
            return jsonify({'success': False, 'message': 'Invalid report type'}), 400
        
        if format_type == 'csv':
            return generate_csv_report(report_data, report_type)
        else:
            return generate_pdf_report(report_data, report_type)
            
    except Exception as e:
        print(f"Error downloading report: {str(e)}")
        return jsonify({'success': False, 'message': f'Error downloading report: {str(e)}'}), 500

def generate_csv_report(data, report_type):
    """Generate CSV format report"""
    output = io.StringIO()
    writer = csv.writer(output)
    
    # Write header
    writer.writerow([f"{report_type.upper()} REPORT - {data.get('period', '')}"])
    writer.writerow([])
    
    if report_type == 'sales':
        writer.writerow(['Metric', 'Value'])
        writer.writerow(['Total Sales', data.get('totalSales', 0)])
        writer.writerow(['Completed Sales', data.get('completedSales', 0)])
        writer.writerow(['Pending Sales', data.get('pendingSales', 0)])
        writer.writerow([])
        writer.writerow(['Status', 'Count'])
        for status, count in data.get('statusBreakdown', {}).items():
            writer.writerow([status, count])
    
    elif report_type == 'orders':
        writer.writerow(['Metric', 'Value'])
        writer.writerow(['Total Orders', data.get('totalOrders', 0)])
        writer.writerow(['Total Value', data.get('totalValue', 0)])
        writer.writerow(['Average Order Value', data.get('averageOrderValue', 0)])
        writer.writerow([])
        writer.writerow(['Date', 'Orders'])
        for date, count in data.get('dailyOrders', {}).items():
            writer.writerow([date, count])
    
    elif report_type == 'products':
        writer.writerow(['Metric', 'Value'])
        writer.writerow(['Total Products', data.get('totalProducts', 0)])
        writer.writerow([])
        writer.writerow(['Category', 'Product Count', 'Sales'])
        for category, count in data.get('categoryBreakdown', {}).items():
            sales = data.get('categorySales', {}).get(category, 0)
            writer.writerow([category, count, sales])
        writer.writerow([])
        writer.writerow(['Top Products', 'Sales', 'Stock', 'Price'])
        for product in data.get('topProducts', [])[:10]:
            writer.writerow([product['name'], product['sales'], product['stock'], product['price']])
    
    elif report_type == 'users':
        writer.writerow(['Metric', 'Value'])
        writer.writerow(['Total Users', data.get('totalUsers', 0)])
        writer.writerow(['Total Sellers', data.get('totalSellers', 0)])
        writer.writerow(['New Users', data.get('newUsers', 0)])
        writer.writerow(['New Sellers', data.get('newSellers', 0)])
        writer.writerow([])
        writer.writerow(['Seller Status', 'Count'])
        for status, count in data.get('sellerStatusBreakdown', {}).items():
            writer.writerow([status, count])
    
    elif report_type == 'revenue':
        writer.writerow(['Metric', 'Value'])
        writer.writerow(['Total Revenue', data.get('totalRevenue', 0)])
        writer.writerow(['Average Daily Revenue', data.get('averageDailyRevenue', 0)])
        writer.writerow([])
        writer.writerow(['Date', 'Revenue'])
        for date, revenue in data.get('dailyRevenue', {}).items():
            writer.writerow([date, revenue])
    
    output.seek(0)
    response = make_response(output.getvalue())
    response.headers['Content-Type'] = 'text/csv'
    response.headers['Content-Disposition'] = f'attachment; filename={report_type}_report.csv'
    return response

def generate_pdf_report(data, report_type):
    """Generate PDF format report"""
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4)
    styles = getSampleStyleSheet()
    story = []
    
    # Title
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=18,
        spaceAfter=30,
        alignment=1  # Center alignment
    )
    
    story.append(Paragraph(f"{report_type.upper()} REPORT", title_style))
    story.append(Paragraph(f"Period: {data.get('period', '')}", styles['Normal']))
    story.append(Spacer(1, 20))
    
    if report_type == 'sales':
        # Sales summary table
        sales_data = [
            ['Metric', 'Value'],
            ['Total Sales', str(data.get('totalSales', 0))],
            ['Completed Sales', str(data.get('completedSales', 0))],
            ['Pending Sales', str(data.get('pendingSales', 0))]
        ]
        
        sales_table = Table(sales_data)
        sales_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 14),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('GRID', (0, 0), (-1, -1), 1, colors.black)
        ]))
        
        story.append(sales_table)
        story.append(Spacer(1, 20))
        
        # Status breakdown
        if data.get('statusBreakdown'):
            story.append(Paragraph("Sales by Status", styles['Heading2']))
            status_data = [['Status', 'Count']]
            for status, count in data.get('statusBreakdown', {}).items():
                status_data.append([status, str(count)])
            
            status_table = Table(status_data)
            status_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('GRID', (0, 0), (-1, -1), 1, colors.black)
            ]))
            story.append(status_table)
    
    elif report_type == 'revenue':
        # Revenue summary
        revenue_data = [
            ['Metric', 'Value (KES)'],
            ['Total Revenue', f"{data.get('totalRevenue', 0):,.2f}"],
            ['Average Daily Revenue', f"{data.get('averageDailyRevenue', 0):,.2f}"]
        ]
        
        revenue_table = Table(revenue_data)
        revenue_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('GRID', (0, 0), (-1, -1), 1, colors.black)
        ]))
        story.append(revenue_table)
    
    # Add more report types as needed...
    
    doc.build(story)
    buffer.seek(0)
    
    response = make_response(buffer.getvalue())
    response.headers['Content-Type'] = 'application/pdf'
    response.headers['Content-Disposition'] = f'attachment; filename={report_type}_report.pdf'
    return response
